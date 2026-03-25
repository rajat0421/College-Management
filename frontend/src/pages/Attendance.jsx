import { useState, useEffect } from 'react';
import { CalendarCheck, Check, X as XIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendance, setAttendance] = useState({});

  const fetchAttendance = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const params = { date };
      if (course) params.course = course;
      if (year) params.year = year;

      const { data } = await api.get('/attendance', { params });
      setStudents(data);

      const map = {};
      data.forEach((s) => {
        if (s.status) map[s._id] = s.status;
      });
      setAttendance(map);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [date, course, year]);

  const toggleStatus = (studentId) => {
    setAttendance((prev) => {
      const current = prev[studentId];
      if (!current || current === 'absent') return { ...prev, [studentId]: 'present' };
      return { ...prev, [studentId]: 'absent' };
    });
  };

  const markAllPresent = () => {
    const map = {};
    students.forEach((s) => { map[s._id] = 'present'; });
    setAttendance(map);
  };

  const markAllAbsent = () => {
    const map = {};
    students.forEach((s) => { map[s._id] = 'absent'; });
    setAttendance(map);
  };

  const handleSubmit = async () => {
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (records.length === 0) {
      toast.error('Mark at least one student');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/attendance/mark', { date, records });
      toast.success(`Attendance marked for ${records.length} students`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">Mark and view daily attendance</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Course</label>
            <input
              type="text"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="All courses"
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            >
              <option value="">All years</option>
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
          No students found for the selected filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3 text-sm">
              <span className="text-emerald-600 font-medium">Present: {presentCount}</span>
              <span className="text-red-600 font-medium">Absent: {absentCount}</span>
              <span className="text-gray-500">Unmarked: {students.length - presentCount - absentCount}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={markAllPresent} className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 font-medium">
                All Present
              </button>
              <button onClick={markAllAbsent} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium">
                All Absent
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Roll No.</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const status = attendance[student._id];
                  return (
                    <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                      <td className="py-3 px-4 text-gray-600">{student.rollNumber || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{student.course} (Yr {student.year})</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setAttendance((prev) => ({ ...prev, [student._id]: 'present' }))}
                            className={`p-1.5 rounded-md transition-colors ${
                              status === 'present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => setAttendance((prev) => ({ ...prev, [student._id]: 'absent' }))}
                            className={`p-1.5 rounded-md transition-colors ${
                              status === 'absent'
                                ? 'bg-red-100 text-red-700'
                                : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                            }`}
                          >
                            <XIcon size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <CalendarCheck size={18} />
              {submitting ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
