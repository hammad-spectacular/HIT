import { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import Navigation, { Tab } from './components/Navigation';
import TodayPage from './components/TodayPage';
import HabitsPage from './components/HabitsPage';
import ProgressPage from './components/ProgressPage';
import ReviewPage from './components/ReviewPage';

export default function App() {
  const { theme, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('today');

  return (
    <>
      {activeTab === 'today' && <TodayPage theme={theme} onToggleTheme={toggle} />}
      {activeTab === 'habits' && <HabitsPage theme={theme} onToggleTheme={toggle} />}
      {activeTab === 'progress' && <ProgressPage theme={theme} onToggleTheme={toggle} />}
      {activeTab === 'review' && (
        <ReviewPage
          theme={theme}
          onToggleTheme={toggle}
          onGoToToday={() => setActiveTab('today')}
        />
      )}
      <Navigation active={activeTab} onChange={setActiveTab} />
    </>
  );
}
