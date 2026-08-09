import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';

export default function App() {
  const { user, loading } = useAuth();
  const { theme, toggle } = useTheme();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0b]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-700 dark:border-t-gray-100" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route
        path="/*"
        element={
          user ? <Dashboard theme={theme} onToggleTheme={toggle} /> : <Navigate to="/login" />
        }
      />
    </Routes>
  );
}
