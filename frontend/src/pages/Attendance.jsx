import { useState, useEffect } from 'react';
import { CalendarCheck, Check, X as XIcon } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Attendance() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [year, setYear] = useState('1');
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/branches');
        setBranches(data);
        if (data.length && !branchId) {
          setBranchId(data[0]._id);
        }
      } catch {
        toast.error('Failed to load branches');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once; branchId intentionally read for init
  }, []);

  useEffect(() => {
    if (!branchId) {
      setSubjects([]);
      setSubjectId('');
      return;
    }
    (async () => {
      try {
        const { data } = await api.get('/subjects/by-branch', {
          params: { branchId, year },
        });
        setSubjects(data);
        setSubjectId((prev) => {
          if (data.some((s) => s._id === prev)) return prev;
          return data[0]?._id || '';
        });
      } catch {
        toast.error('Failed to load subjects');
        setSubjects([]);
        setSubjectId('');
      }
    })();
  }, [branchId, year]);

  const fetchAttendance = async () => {
    if (!date || !branchId || !year || !subjectId) {
      setStudents([]);
      setAttendance({});
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/attendance', {
        params: { date, branchId, year, subjectId },
      });
      setStudents(data);

      const map = {};
      data.forEach((s) => {
        if (s.status) map[s._id] = s.status;
      });
      setAttendance(map);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when filters/date change
  }, [date, branchId, year, subjectId]);

  const markAllPresent = () => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = 'present';
    });
    setAttendance(map);
  };

  const markAllAbsent = () => {
    const map = {};
    students.forEach((s) => {
      map[s._id] = 'absent';
    });
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
      await api.post('/attendance/mark', {
        date,
        branchId,
        subjectId,
        year: Number(year),
        records,
      });
      toast.success(`Attendance marked for ${records.length} students`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length;

  const filtersReady = branchId && year && subjectId;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose branch, year, and subject — the subject list follows branch and year.
        </p>
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
              <option value="">Select branch</option>
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
              {[1, 2, 3, 4, 5, 6].map((y) => (
                <option key={y} value={String(y)}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!branchId || subjects.length === 0}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-w-[180px] disabled:bg-gray-100"
            >
              {!branchId ? (
                <option value="">Select branch first</option>
              ) : subjects.length === 0 ? (
                <option value="">No subjects for this year</option>
              ) : (
                subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>
      </div>

      {!filtersReady ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
          {branches.length === 0
            ? 'No branches defined. An admin must add branches and subjects first.'
            : 'Select branch, year, and subject to load students.'}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-sm">
          No students in this branch and year.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3 text-sm">
              <span className="text-emerald-600 font-medium">Present: {presentCount}</span>
              <span className="text-red-600 font-medium">Absent: {absentCount}</span>
              <span className="text-gray-500">
                Unmarked: {students.length - presentCount - absentCount}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={markAllPresent}
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 font-medium"
              >
                All Present
              </button>
              <button
                type="button"
                onClick={markAllAbsent}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium"
              >
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
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Branch</th>
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
                      <td className="py-3 px-4 text-gray-600">
                        {student.branchName} (Yr {student.year})
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setAttendance((prev) => ({ ...prev, [student._id]: 'present' }))
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              status === 'present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            <Check size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAttendance((prev) => ({ ...prev, [student._id]: 'absent' }))
                            }
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
              type="button"
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
