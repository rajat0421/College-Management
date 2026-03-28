import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const YEAR_OPTS = [1, 2, 3, 4, 5, 6];

function yearsLabel(years) {
  if (!years || years.length === 0) return 'All years';
  return years.sort((a, b) => a - b).join(', ');
}

export default function Subjects() {
  const [branches, setBranches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    branchId: '',
    years: [],
    allYears: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        api.get('/branches'),
        api.get('/subjects/all'),
      ]);
      setBranches(bRes.data);
      setSubjects(sRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: '',
      branchId: branches[0]?._id || '',
      years: [],
      allYears: true,
    });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s._id);
    const y = s.years || [];
    setForm({
      name: s.name,
      branchId: s.branchId?._id || s.branchId,
      years: [...y],
      allYears: y.length === 0,
    });
    setModalOpen(true);
  };

  const toggleYear = (y) => {
    setForm((f) => {
      if (f.allYears) {
        return { ...f, allYears: false, years: [y] };
      }
      const has = f.years.includes(y);
      const next = has ? f.years.filter((x) => x !== y) : [...f.years, y];
      return { ...f, years: next, allYears: next.length === 0 };
    });
  };

  const setAllYears = (checked) => {
    setForm((f) => ({ ...f, allYears: checked, years: checked ? [] : f.years.length ? f.years : [1] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.branchId) {
      toast.error('Select a branch');
      return;
    }
    const yearsPayload = form.allYears ? [] : form.years;
    if (!form.allYears && yearsPayload.length === 0) {
      toast.error('Select at least one year, or use “All years”');
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        branchId: form.branchId,
        years: yearsPayload,
      };
      if (editing) {
        await api.put(`/subjects/${editing}`, body);
        toast.success('Subject updated');
      } else {
        await api.post('/subjects', body);
        toast.success('Subject added');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      toast.success('Subject deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Subjects per branch. Optional year filter: empty means all years. Teachers see subjects
            for the branch and year they select when marking attendance.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          disabled={branches.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Plus size={18} />
          Add subject
        </button>
      </div>

      {branches.length === 0 && !loading && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          Add at least one branch before creating subjects.
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No subjects yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Branch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Years</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{s.name}</td>
                    <td className="py-3 px-4 text-gray-600">{s.branchId?.name || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{yearsLabel(s.years)}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit subject' : 'Add subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={form.allYears}
                onChange={(e) => setAllYears(e.target.checked)}
              />
              All years
            </label>
            {!form.allYears && (
              <div className="flex flex-wrap gap-2">
                {YEAR_OPTS.map((y) => (
                  <label
                    key={y}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={form.years.includes(y)}
                      onChange={() => toggleYear(y)}
                    />
                    Year {y}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : editing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
