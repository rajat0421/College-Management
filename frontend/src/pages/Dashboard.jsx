import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  UserPlus,
  ClipboardList,
  TrendingDown,
  AlertTriangle,
  Send,
  FileBarChart,
} from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Total Teachers',
      value: stats?.totalTeachers || 0,
      icon: Users,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Present Today',
      value: stats?.todayAttendance?.present || 0,
      icon: CalendarCheck,
      color: 'bg-violet-50 text-violet-600',
    },
    {
      title: 'Absent Today',
      value: stats?.todayAttendance?.absent || 0,
      icon: CalendarCheck,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'Low Attendance',
      value: stats?.lowAttendanceCount || 0,
      icon: TrendingDown,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Absent Streak',
      value: stats?.consecutiveAbsentCount || 0,
      icon: AlertTriangle,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const atRisk = stats?.atRiskStudents || [];
  const recentAlerts = stats?.recentAlerts || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your college</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.color}`}>
                <card.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {atRisk.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">At Risk Students</h2>
            <button
              onClick={() => navigate('/report')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View full report
            </button>
          </div>
          <div className="space-y-3">
            {atRisk.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">
                      {student.branchName}
                      {student.year != null ? ` · Year ${student.year}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    {student.flags.lowAttendance && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <TrendingDown size={12} />
                        {student.percentage}%
                      </span>
                    )}
                    {student.flags.absentStreak && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        <AlertTriangle size={12} />
                        {student.consecutiveAbsent}d
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/students')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <UserPlus size={18} />
              Add Student
            </button>
            <button
              onClick={() => navigate('/attendance')}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium"
            >
              <ClipboardList size={18} />
              Mark Attendance
            </button>
            <button
              onClick={() => navigate('/report')}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              <FileBarChart size={18} />
              Smart Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h2>
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-gray-400">No alerts sent yet</p>
          ) : (
            <div className="space-y-2.5">
              {recentAlerts.map((alert) => (
                <div key={alert._id} className="flex items-start gap-3 text-sm">
                  <Send size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-700">
                      <span className="font-medium">{alert.studentId?.name || 'Unknown'}</span>
                      {' — '}
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400">
                      Sent to {alert.sentTo} &middot;{' '}
                      {new Date(alert.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
