import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-700"
      >
        <Menu size={24} />
      </button>

      <div className="hidden lg:block">
        <h2 className="text-sm text-gray-500">
          Welcome back, <span className="font-semibold text-gray-800">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium capitalize">
          {user?.role}
        </span>
        <span className="text-sm text-gray-600 hidden sm:block">{user?.collegeName}</span>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
