import { Calendar, ChevronLeft, ChevronRight, Moon, Settings, Sun } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { storage } from '../lib/storage';
import { calcMonthlyPerformance, type DailyPerformance } from '../lib/habitStats';
import { computeMonthlyReview, getPreviousMonth, type MonthlyReviewData } from '../lib/monthlyReview';
import type { MonthData } from '../types';
import SectionCard from './SectionCard';

interface Props {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onGoToToday?: () => void;
  onGoToReview?: () => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function OverviewPage({ theme, onToggleTheme, onGoToToday, onGoToReview }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
  const [data, setData] = useState<MonthData | null>(null);
  const [review, setReview] = useState<MonthlyReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const daysInMonth = new Date(year, month, 0).getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;
  const isViewingPastMonth = !isCurrentMonth;

  // Calculate current day for stats (today if current month, last day if past)
  const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;

  // Load data
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const monthData = await storage.getMonth(year, month);
        if (!cancelled) {
          setData(monthData);
          // Also compute review
          const prevCoords = getPreviousMonth(year, month);
          const previous = await storage.getMonth(prevCoords.year, prevCoords.month);
          setReview(computeMonthlyReview(monthData, previous));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  // Auto-scroll to today on mount
  useEffect(() => {
    if (!isCurrentMonth || !chartRef.current) return;
    const scrollContainer = chartRef.current.querySelector('.chart-scroll');
    if (!scrollContainer) return;

    const dayWidth = 40; // approximate width per day
    const scrollPosition = (today.getDate() - 1) * dayWidth - scrollContainer.clientWidth / 2 + dayWidth / 2;
    scrollContainer.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
  }, [isCurrentMonth, loading]);

  // Calculate monthly performance data
  const performanceData = useMemo(() => {
    if (!data) return [];
    return calcMonthlyPerformance(data.habits, year, month, currentDay);
  }, [data, year, month, currentDay]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (performanceData.length === 0) {
      return { average: 0, bestDay: null, worstDay: null, currentStreak: 0 };
    }

    const nonNoActivity = performanceData.filter((d) => !d.noActivity);

    if (nonNoActivity.length === 0) {
      return { average: 0, bestDay: null, worstDay: null, currentStreak: data?.overall.currentStreak ?? 0 };
    }

    const average = Math.round(nonNoActivity.reduce((sum, d) => sum + d.percentage, 0) / nonNoActivity.length);

    const bestDay = nonNoActivity.reduce((best, d) => (d.percentage > best.percentage ? d : best), nonNoActivity[0]);
    const worstDay = nonNoActivity.reduce((worst, d) => (d.percentage < worst.percentage ? d : worst), nonNoActivity[0]);

    return {
      average,
      bestDay: { day: bestDay.day, percentage: bestDay.percentage },
      worstDay: { day: worstDay.day, percentage: worstDay.percentage },
      currentStreak: data?.overall.currentStreak ?? 0,
    };
  }, [performanceData, data]);

  // Best and attention habits from review
  const reviewStats = useMemo(() => {
    if (!review) return { bestHabit: null, needsAttention: null };
    return {
      bestHabit: review.bestHabit,
      needsAttention: review.needsAttention,
    };
  }, [review]);

  // Navigate months
  const navigateMonth = useCallback((dir: number) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDay(null);
  }, [month, year]);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDay(null);
    onGoToToday?.();
  }, [onGoToToday]);

  const handleGoToReview = useCallback(() => {
    onGoToReview?.();
  }, [onGoToReview]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600 dark:border-gray-700 dark:border-t-indigo-400" />
      </div>
    );
  }

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  return (
    <div className="min-h-screen pb-20 bg-gray-50 text-gray-900 dark:bg-[#0a0a0b] dark:text-gray-100">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 px-3 py-2.5 backdrop-blur dark:border-gray-800 dark:bg-[#0a0a0b]/95 sm:px-4 sm:py-3 lg:px-8">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Overview</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Monthly performance</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Month navigator */}
            <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-[#151519]">
              <button
                onClick={() => navigateMonth(-1)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-gray-50 disabled:opacity-30 dark:hover:bg-[#1f1f24]"
                title="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-[7rem] px-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                {monthLabel}
              </span>
              <button
                onClick={() => navigateMonth(1)}
                disabled={isCurrentMonth}
                className="flex h-9 w-9 cursor-pointer items-center justify-center hover:bg-gray-50 disabled:opacity-30 dark:hover:bg-[#1f1f24]"
                title="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Today button */}
            {isViewingPastMonth && (
              <button
                onClick={goToToday}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/60"
              >
                <Calendar size={14} /> Today
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:bg-[#151519] dark:hover:bg-[#1f1f24]"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-[#1a1a1f]">
                  <button
                    onClick={() => {
                      onToggleTheme();
                      setShowSettingsMenu(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-[#252529]"
                  >
                    {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                    {theme === 'light' ? 'Dark mode' : 'Light mode'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1100px] px-3 py-6 sm:px-4 sm:py-10 lg:px-8">
        <div className="space-y-8 sm:space-y-10">
          {/* Performance Chart */}
          <SectionCard title="Daily Performance" subtitle="Completion per day." variant="insights">
            <div ref={chartRef} className="relative">
              {performanceData.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                  No data yet.
                </div>
              ) : (
                <PerformanceChart
                  data={performanceData}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                />
              )}
            </div>
          </SectionCard>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="Average" value={`${summaryStats.average}%`} highlight />
            <SummaryCard
              label="Best"
              value={summaryStats.bestDay ? `Day ${summaryStats.bestDay.day}` : '—'}
              sub={summaryStats.bestDay ? `${summaryStats.bestDay.percentage}%` : undefined}
            />
            <SummaryCard
              label="Worst"
              value={summaryStats.worstDay ? `Day ${summaryStats.worstDay.day}` : '—'}
              sub={summaryStats.worstDay ? `${summaryStats.worstDay.percentage}%` : undefined}
            />
            <SummaryCard label="Streak" value={`${summaryStats.currentStreak}d`} highlight />
          </div>

          {/* Best / Attention Habits */}
          <SectionCard title="Habit Performance" subtitle="">
            <div className="space-y-4">
              {reviewStats.bestHabit && (
                <div className="review-item">
                  <p className="review-item-label">🏆 Top</p>
                  <p className="review-item-value">{reviewStats.bestHabit.name}</p>
                  <p className="review-item-sub">{reviewStats.bestHabit.percentage}% completion</p>
                </div>
              )}
              {reviewStats.needsAttention ? (
                <div className="review-item review-item-warn">
                  <p className="review-item-label">⚠ Struggling</p>
                  <p className="review-item-value">{reviewStats.needsAttention.name}</p>
                  <p className="review-item-sub">{reviewStats.needsAttention.percentage}% completion</p>
                </div>
              ) : (
                <div className="review-item">
                  <p className="review-item-label">⚠ Struggling</p>
                  <p className="review-item-value text-emerald-600 dark:text-emerald-400">All on track</p>
                  <p className="review-item-sub">Above 80%</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Focus Recommendation */}
          {review && (
            <SectionCard title="Next Month Focus" subtitle="" variant="review">
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{review.focusRecommendation}</p>
              <button
                onClick={handleGoToReview}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Review →
              </button>
            </SectionCard>
          )}
        </div>
      </main>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

function SummaryCard({ label, value, sub, highlight }: SummaryCardProps) {
  return (
    <div className="insight-card">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`mt-2 text-lg font-bold ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

// Performance Chart Component
interface PerformanceChartProps {
  data: DailyPerformance[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

function PerformanceChart({ data, selectedDay, onSelectDay }: PerformanceChartProps) {
  const chartHeight = 200;
  const chartPadding = { top: 20, bottom: 30, left: 10, right: 10 };
  const dayWidth = 40;
  const axisWidth = 30;
  const daysInMonth = data.length || 31;

  // Ensure minimum width so chart is always visible
  const chartWidth = Math.max(600, daysInMonth * dayWidth);
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  // Calculate points
  const points = data.map((d, i) => ({
    ...d,
    x: chartPadding.left + i * dayWidth + dayWidth / 2,
    y: d.noActivity ? chartHeight - chartPadding.bottom : chartPadding.top + ((100 - d.percentage) / 100) * innerHeight,
  }));

  // Build polyline path
  const buildPolylinePath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  // Build area fill path
  const buildAreaPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const bottomY = chartHeight - chartPadding.bottom;
    return `${linePath} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;
  };

  // Split points into solid and dashed segments (noActivity = dashed)
  const segments: { points: typeof points; dashed: boolean }[] = [];
  let currentSegment: typeof points = [];
  let currentDashed = false;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const isNoActivity = p.noActivity;

    if (currentSegment.length > 0 && isNoActivity !== currentDashed) {
      // Switch segment
      segments.push({ points: [...currentSegment], dashed: currentDashed });
      currentSegment = [];
    }

    currentSegment.push(p);
    currentDashed = isNoActivity;
  }
  if (currentSegment.length > 0) {
    segments.push({ points: [...currentSegment], dashed: currentDashed });
  }

  // Day labels (show every 5 days plus first and last)
  const showLabelForDay = (day: number) => {
    return day === 1 || day % 5 === 0 || day === daysInMonth;
  };

  const selectedPoint = selectedDay !== null ? points.find((p) => p.day === selectedDay) : null;

  // Touch handling for mobile
  const handleTouch = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;

    const dayIndex = Math.round((x - chartPadding.left) / dayWidth);
    if (dayIndex >= 0 && dayIndex < data.length) {
      onSelectDay(data[dayIndex].day);
    }
  }, [data, dayWidth, chartPadding.left, onSelectDay]);

  return (
    <div className="relative flex gap-1">
      {/* Fixed Y-axis labels (stay visible while chart scrolls) */}
      <div className="relative shrink-0" style={{ width: axisWidth, height: chartHeight }}>
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = chartPadding.top + ((100 - pct) / 100) * innerHeight;
          return (
            <div
              key={pct}
              className="absolute right-1 -translate-y-1/2 text-[10px] leading-none text-gray-400"
              style={{ top: y }}
            >
              {pct}%
            </div>
          );
        })}
      </div>

      {/* Scrollable chart */}
      <div className="chart-scroll relative flex-1 overflow-x-auto">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          onTouchStart={handleTouch}
        >
          {/* Y-axis grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const y = chartPadding.top + ((100 - pct) / 100) * innerHeight;
            return (
              <line
                key={pct}
                x1={chartPadding.left}
                y1={y}
                x2={chartWidth - chartPadding.right}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.1"
                strokeDasharray={pct === 0 ? 'none' : '2,4'}
              />
            );
          })}

          {/* Area fill (solid segments only) */}
          {segments.filter((s) => !s.dashed).map((segment, i) => {
            const areaPath = buildAreaPath(segment.points);
            return (
              <path
                key={`area-${i}`}
                d={areaPath}
                fill="url(#areaGradient)"
                opacity="0.3"
              />
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Lines and points */}
          {segments.map((segment, i) => {
            const linePath = buildPolylinePath(segment.points);
            return (
              <g key={`segment-${i}`}>
                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeDasharray={segment.dashed ? '4,4' : 'none'}
                  strokeOpacity={segment.dashed ? '0.3' : '1'}
                />
                {/* Points (only for non-noActivity) */}
                {!segment.dashed && segment.points.map((p) => (
                  <circle
                    key={p.day}
                    cx={p.x}
                    cy={p.y}
                    r={selectedDay === p.day ? 6 : 4}
                    fill="#6366f1"
                    stroke="white"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onClick={() => onSelectDay(selectedDay === p.day ? null : p.day)}
                    onMouseEnter={() => onSelectDay(p.day)}
                    onMouseLeave={() => onSelectDay(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* X-axis day labels */}
          {points.map((p) => {
            if (!showLabelForDay(p.day)) return null;
            return (
              <text
                key={`label-${p.day}`}
                x={p.x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-gray-400"
                style={{ fontSize: '10px' }}
              >
                {p.day}
              </text>
            );
          })}
        </svg>

        {/* Tooltip */}
        {selectedDay !== null && selectedPoint && (
          <Tooltip point={selectedPoint} chartWidth={chartWidth} />
        )}
      </div>
    </div>
  );
}

// Tooltip Component
interface TooltipProps {
  point: DailyPerformance & { x: number; y: number };
  chartWidth: number;
}

function Tooltip({ point, chartWidth }: TooltipProps) {
  const tooltipWidth = 160;
  const tooltipHeight = 80;

  // Position tooltip above the point, with bounds checking
  let x = point.x - tooltipWidth / 2;
  let y = point.y - tooltipHeight - 12;

  // Keep tooltip within bounds
  if (x < 0) x = 0;
  if (x + tooltipWidth > chartWidth) x = chartWidth - tooltipWidth;
  if (y < 0) y = point.y + 12;

  const [, monthStr, dayStr] = point.date.split('-');
  const monthIndex = parseInt(monthStr, 10) - 1;
  const dateLabel = `${MONTH_NAMES[monthIndex]} ${parseInt(dayStr, 10)}`;

  return (
    <div
      className="pointer-events-none absolute z-10 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-[#1a1a1f]"
      style={{
        left: x,
        top: y,
        width: tooltipWidth,
      }}
    >
      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{dateLabel}</p>
      {point.noActivity ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">No habits scheduled</p>
      ) : (
        <>
          <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">{point.percentage}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{point.completed}/{point.scheduled} completed</p>
        </>
      )}
    </div>
  );
}
