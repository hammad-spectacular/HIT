import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken);

router.get('/:date', async (req: AuthRequest, res) => {
  const reflection = await prisma.dailyReflection.findUnique({
    where: {
      userId_date: { userId: req.userId!, date: req.params.date },
    },
  });
  res.json(reflection);
});

router.post('/', async (req: AuthRequest, res) => {
  const schema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    mood: z.enum(['happy', 'neutral', 'sad']).optional(),
    energy: z.number().min(1).max(10).optional(),
    remarks: z.string().optional(),
    tomorrowFocus: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const reflection = await prisma.dailyReflection.upsert({
    where: {
      userId_date: { userId: req.userId!, date: parsed.data.date },
    },
    update: parsed.data,
    create: { ...parsed.data, userId: req.userId! },
  });

  res.json(reflection);
});

router.get('/yesterday/:date', async (req: AuthRequest, res) => {
  const date = new Date(req.params.date);
  date.setDate(date.getDate() - 1);
  const yesterdayStr = date.toISOString().split('T')[0];

  const reflection = await prisma.dailyReflection.findUnique({
    where: {
      userId_date: { userId: req.userId!, date: yesterdayStr },
    },
  });

  res.json(reflection);
});

export default router;
