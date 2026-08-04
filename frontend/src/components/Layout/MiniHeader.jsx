import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MiniHeader = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-gray-200 dark:text-gray-700 select-none">|</span>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default MiniHeader;
