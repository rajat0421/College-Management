import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarCheck,
  FileBarChart,
  UserCircle,
  X,
  GitBranch,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const baseNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { to: '/report', label: 'Smart Report', icon: FileBarChart },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const adminNav = [
  { to: '/students', label: 'Students', icon: GraduationCap },
  { to: '/teachers', label: 'Teachers', icon: Users },
  { to: '/branches', label: 'Branches', icon: GitBranch },
  { to: '/subjects', label: 'Subjects', icon: BookOpen },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? [...adminNav, ...baseNav] : baseNav;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">CollegeMS</h1>
          <button type="button" onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
