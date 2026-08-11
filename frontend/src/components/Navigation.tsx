import { CalendarDays, CheckSquare, BarChart3, Star } from 'lucide-react';

export type Tab = 'today' | 'habits' | 'progress' | 'review';

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'today', label: 'Today', icon: <CheckSquare size={16} /> },
  { id: 'habits', label: 'Habits', icon: <Star size={16} /> },
  { id: 'progress', label: 'Progress', icon: <BarChart3 size={16} /> },
  { id: 'review', label: 'Review', icon: <CalendarDays size={16} /> },
];

export default function Navigation({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200/80 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-[#0a0a0b]/95" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto flex max-w-[600px]">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
