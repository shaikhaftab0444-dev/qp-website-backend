import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UNIVERSITY_DATA = {
  DBATU: {
    courses: ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'Diploma'],
    branches: {
      'B.Tech': ['Computer Engineering','Information Technology','Mechanical Engineering','Civil Engineering','Electronics & Telecommunication Engineering','Electrical Engineering','Chemical Engineering','Automobile Engineering','Agricultural Engineering','Food Technology','Textile Technology'],
      'M.Tech': ['Computer Engineering','Mechanical Engineering','Civil Engineering','Electronics Engineering','Electrical Engineering'],
      'MBA': ['MBA'],
      'MCA': ['MCA'],
      'Diploma': ['Computer Engineering','Mechanical Engineering','Civil Engineering','Electronics Engineering','Electrical Engineering'],
    },
    semesters: {
      'B.Tech': ['1','2','3','4','5','6','7','8'],
      'M.Tech': ['1','2','3','4'],
      'MBA': ['1','2','3','4'],
      'MCA': ['1','2','3','4','5','6'],
      'Diploma': ['1','2','3','4','5','6'],
    },
  },
  BAMBU: {
    courses: ['B.Tech','M.Tech','B.Pharm','M.Pharm','MBA','MCA','B.Sc','M.Sc'],
    branches: {
      'B.Tech': ['Computer Science & Engineering','Information Technology','Mechanical Engineering','Civil Engineering','Electronics & Communication Engineering','Electrical Engineering','Chemical Engineering'],
      'M.Tech': ['Computer Science & Engineering','Mechanical Engineering','Civil Engineering','Electrical Engineering'],
      'B.Pharm': ['Pharmacy'],
      'M.Pharm': ['Pharmacy'],
      'MBA': ['MBA'],
      'MCA': ['MCA'],
      'B.Sc': ['Physics','Chemistry','Mathematics','Biology','Computer Science'],
      'M.Sc': ['Physics','Chemistry','Mathematics','Biology','Computer Science'],
    },
    semesters: {
      'B.Tech': ['1','2','3','4','5','6','7','8'],
      'M.Tech': ['1','2','3','4'],
      'B.Pharm': ['1','2','3','4','5','6','7','8'],
      'M.Pharm': ['1','2','3','4'],
      'MBA': ['1','2','3','4'],
      'MCA': ['1','2','3','4','5','6'],
      'B.Sc': ['1','2','3','4','5','6'],
      'M.Sc': ['1','2','3','4'],
    },
  },
};

const YEARS = [];
for (let y = 2026; y >= 2015; y--) YEARS.push(String(y));
const EXAM_TYPES = ['Winter','Summer','Mid Sem','Backlog','Ex-Students'];
const EMPTY_FORM = { title:'', university:'DBATU', course:'B.Tech', branch:'', semester:'', year:'', examType:'Winter', subject:'' };

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterUni, setFilterUni] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchPapers();
  }, []);

  useEffect(() => {
    if (form.subject && form.semester && form.year) {
      const autoTitle = form.subject + ' - Sem ' + form.semester + ' ' + form.examType + ' ' + form.year;
      setForm((f) => ({ ...f, title: autoTitle }));
    }
  }, [form.subject, form.semester, form.year, form.examType]);

  const fetchPapers = async () => {
    try {
      const res = await API.get('/papers');
      setPapers(res.data);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  const showMsg = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleChange = (field, value) => {
    setForm((f) => {
      const updated = { ...f, [field]: value };
      if (field === 'university') {
        updated.course = UNIVERSITY_DATA[value].courses[0];
        updated.branch = '';
        updated.semester = '';
      }
      if (field === 'course') {
        updated.branch = '';
        updated.semester = '';
      }
      return updated;
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { showMsg('Please select a PDF file.', 'error'); return; }
    setUploading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      data.append('pdf', file);
      await API.post('/papers/upload', data);
      showMsg('Paper uploaded successfully!', 'success');
      setForm(EMPTY_FORM);
      setFile(null);
      document.getElementById('fileInput').value = '';
      fetchPapers();
    } catch (err) {
      showMsg('Upload failed: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this paper?')) return;
    try {
      await API.delete('/papers/' + id);
      showMsg('Paper deleted.', 'success');
      fetchPapers();
    } catch {
      showMsg('Delete failed.', 'error');
    }
  };

  const uniData = UNIVERSITY_DATA[form.university];
  const branches = uniData.branches[form.course] || [];
  const semesters = uniData.semesters[form.course] || [];

  const filtered = papers.filter((p) => {
    const matchUni = !filterUni || p.university === filterUni;
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.subject.toLowerCase().includes(search.toLowerCase()) ||
      p.branch.toLowerCase().includes(search.toLowerCase());
    return matchUni && matchSearch;
  });

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      <div className="max-w-6xl mx-auto p-6">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Total Papers: <strong>{papers.length}</strong></p>
          </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>

        {message.text && (
          <div className={
            'mb-5 px-4 py-3 rounded-lg text-sm font-medium border ' +
            (message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')
          }>
            {message.text}
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Upload New Question Paper</h2>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">University *</label>
              <select className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.university} onChange={(e) => handleChange('university', e.target.value)}>
                <option value="DBATU">DBATU</option>
                <option value="BAMBU">BAMBU</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Course *</label>
              <select className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.course} onChange={(e) => handleChange('course', e.target.value)}>
                {uniData.courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Branch *</label>
              <select className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.branch} onChange={(e) => handleChange('branch', e.target.value)} required>
                <option value="">-- Select Branch --</option>
                {branches.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Semester *</label>
              <select className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.semester} onChange={(e) => handleChange('semester', e.target.value)} required>
                <option value="">-- Select Semester --</option>
                {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Exam Year *</label>
              <select className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.year} onChange={(e) => handleChange('year', e.target.value)} required>
                <option value="">-- Select Year --</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Exam Type *</label>
              <select className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.examType} onChange={(e) => handleChange('examType', e.target.value)}>
                {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Subject Name *</label>
              <input
                className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Engineering Mathematics"
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Paper Title * <span className="text-blue-500 normal-case font-normal">(auto-filled, you can edit)</span>
              </label>
              <input
                className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title auto-fills when you fill subject, semester, year"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">PDF File *</label>
              <input
                id="fileInput"
                type="file"
                accept=".pdf"
                className="border border-gray-300 w-full p-2.5 rounded-lg text-sm bg-white cursor-pointer"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Only PDF files accepted. Max 10MB.</p>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition disabled:opacity-60"
              >
                {uploading ? 'Uploading...' : 'Upload Question Paper'}
              </button>
            </div>
          </form>
        </div>

        {/* Papers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-800">All Papers ({filtered.length})</h2>
            <div className="flex gap-3">
              <select className="border border-gray-300 p-2 rounded-lg text-sm"
                value={filterUni} onChange={(e) => setFilterUni(e.target.value)}>
                <option value="">All Universities</option>
                <option value="DBATU">DBATU</option>
                <option value="BAMBU">BAMBU</option>
              </select>
              <input
                className="border border-gray-300 p-2 rounded-lg text-sm w-48"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div style={{ fontSize: '3rem' }}>📄</div>
              <p className="mt-2 font-medium">No papers uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Title / Subject</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Univ.</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Course</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Branch</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Sem</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Year</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p._id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800 truncate max-w-xs" title={p.title}>{p.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.subject}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={
                          'text-xs font-semibold px-2 py-1 rounded-full ' +
                          (p.university === 'DBATU' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')
                        }>
                          {p.university}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.course}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs" style={{ maxWidth: '160px' }}>
                        <div className="truncate" title={p.branch}>{p.branch}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-center">{p.semester}</td>
                      <td className="px-4 py-3 text-gray-600">{p.year}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a
                            href={p.filePath}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg text-xs font-medium transition"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-xs font-medium transition"
                          >
                            Delete
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
      </div>
    </div>
  );
}
