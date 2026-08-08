import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { calculateStreak, calculateOverallStreak } from '../utils/stats.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/', async (req: AuthRequest, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.userId, isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: { records: true },
  });
  res.json(habits);
});

router.post('/', async (req: AuthRequest, res) => {
  const schema = z.object({
    name: z.string().min(1),
    category: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const habit = await prisma.habit.create({
    data: { ...parsed.data, userId: req.userId! },
  });
  res.status(201).json(habit);
});

router.get('/month/:year/:month', async (req: AuthRequest, res) => {
  const year = parseInt(req.params.year, 10);
  const month = parseInt(req.params.month, 10);

  const habits = await prisma.habit.findMany({
    where: { userId: req.userId, isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      records: {
        where: {
          date: {
            gte: `${year}-${String(month).padStart(2, '0')}-01`,
            lte: `${year}-${String(month).padStart(2, '0')}-31`,
          },
        },
      },
    },
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;

  const enriched = habits.map((habit) => {
    const recordMap = new Map(habit.records.map((r) => [r.date, r.completed]));
    const records: boolean[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      records.push(recordMap.get(dateStr) ?? false);
    }

    const relevant = records.slice(0, currentDay);
    const done = relevant.filter(Boolean).length;
    const pct = Math.round((done / currentDay) * 100);
    const streaks = calculateStreak(relevant);

    return {
      ...habit,
      records,
      stats: {
        completed: done,
        missed: currentDay - done,
        percentage: pct,
        currentStreak: streaks.current,
        longestStreak: streaks.longest,
      },
    };
  });

  const allRelevant = enriched.map((h) => h.records.slice(0, currentDay));
  const overallStreak = calculateOverallStreak(allRelevant);
  const totalCells = enriched.length * currentDay;
  const totalDone = enriched.reduce((sum, h) => sum + h.stats.completed, 0);
  const overallPct = totalCells > 0 ? Math.round((totalDone / totalCells) * 100) : 0;

  res.json({
    habits: enriched,
    overall: {
      percentage: overallPct,
      currentStreak: overallStreak.current,
      longestStreak: overallStreak.longest,
    },
    meta: { year, month, daysInMonth, currentDay, isCurrentMonth },
  });
});

router.post('/:habitId/record', async (req: AuthRequest, res) => {
  const schema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    completed: z.boolean(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const habitId = parseInt(req.params.habitId, 10);
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId: req.userId },
  });

  if (!habit) {
    res.status(404).json({ error: 'Habit not found' });
    return;
  }

  const record = await prisma.habitRecord.upsert({
    where: {
      habitId_date: { habitId, date: parsed.data.date },
    },
    update: {
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
    create: {
      habitId,
      date: parsed.data.date,
      completed: parsed.data.completed,
      completedAt: parsed.data.completed ? new Date() : null,
    },
  });

  res.json(record);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id, 10);
  await prisma.habit.deleteMany({
    where: { id, userId: req.userId },
  });
  res.status(204).send();
});

export default router;
