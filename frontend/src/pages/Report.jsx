import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Send, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Report() {
  const [report, setReport] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('');
  const [year, setYear] = useState('');
  const [sendingId, setSendingId] = useState(null);
  const [sendingBulk, setSendingBulk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/branches');
        setBranches(data);
      } catch {
        toast.error('Failed to load branches');
      }
    })();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (branchId) params.branchId = branchId;
      if (year) params.year = year;
      const { data } = await api.get('/attendance/smart-report', { params });
      setReport(data);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when filters change
  }, [branchId, year]);

  const flaggedStudents = report.filter(
    (s) => s.flags.lowAttendance || s.flags.absentStreak
  );

  const sendAlert = async (studentId, type) => {
    setSendingId(studentId);
    try {
      const { data } = await api.post('/alerts/send', { studentId, type });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setSendingId(null);
    }
  };

  const sendBulkAlerts = async () => {
    if (flaggedStudents.length === 0) return;

    const withEmail = flaggedStudents.filter((s) => s.email);
    if (withEmail.length === 0) {
      toast.error('No flagged students have an email set');
      return;
    }

    setSendingBulk(true);
    try {
      const studentIds = withEmail.map((s) => s._id);
      const { data } = await api.post('/alerts/send-bulk', {
        studentIds,
        type: 'low_attendance',
      });
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alerts');
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            {flaggedStudents.length} student{flaggedStudents.length !== 1 ? 's' : ''} flagged
          </p>
        </div>
        {flaggedStudents.length > 0 && (
          <button
            type="button"
            onClick={sendBulkAlerts}
            disabled={sendingBulk}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {sendingBulk ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Send All Alerts
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[160px]"
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
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
                <option key={y} value={String(y)}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : report.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
          No students found for the selected filters.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Roll No.</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Branch</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Present</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Absent</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Attendance %</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Absent Streak</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {report.map((student) => {
                  const isFlagged = student.flags.lowAttendance || student.flags.absentStreak;
                  return (
                    <tr
                      key={student._id}
                      className={`border-b border-gray-100 ${isFlagged ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{student.name}</td>
                      <td className="py-3 px-4 text-gray-600">{student.rollNumber || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {student.branchName} (Yr {student.year})
                      </td>
                      <td className="py-3 px-4 text-center text-emerald-600 font-medium">
                        {student.present}
                      </td>
                      <td className="py-3 px-4 text-center text-red-600 font-medium">
                        {student.absent}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                            student.percentage >= 75
                              ? 'bg-emerald-100 text-emerald-700'
                              : student.percentage >= 50
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {student.percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {student.consecutiveAbsent >= 3 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                            <AlertTriangle size={12} />
                            {student.consecutiveAbsent} days
                          </span>
                        ) : (
                          <span className="text-gray-400">{student.consecutiveAbsent}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {student.flags.lowAttendance && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              <TrendingDown size={12} />
                              Low
                            </span>
                          )}
                          {student.flags.absentStreak && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              <AlertTriangle size={12} />
                              Streak
                            </span>
                          )}
                          {!isFlagged && (
                            <span className="text-emerald-600 text-xs font-medium">OK</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isFlagged && (
                          <button
                            type="button"
                            onClick={() =>
                              sendAlert(
                                student._id,
                                student.flags.lowAttendance ? 'low_attendance' : 'consecutive_absent'
                              )
                            }
                            disabled={sendingId === student._id || !student.email}
                            title={!student.email ? 'No student email set' : 'Send alert email'}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {sendingId === student._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                            Alert
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
