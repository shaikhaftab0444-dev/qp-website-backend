import { useEffect, useState } from 'react';
import API from '../api/axios';

const BRANCHES = [
  'Computer Engineering',
  'Information Technology',
  'Computer Science & Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Telecommunication Engineering',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Automobile Engineering',
  'Agricultural Engineering',
  'Food Technology',
  'Textile Technology',
  'MCA',
  'MBA',
  'Pharmacy',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Biology',
];

const YEARS = [];
for (let y = 2026; y >= 2015; y--) YEARS.push(String(y));

export default function Home() {
  const [papers, setPapers] = useState([]);
  const [filters, setFilters] = useState({ university: '', branch: '', semester: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const query = [];
      if (filters.university) query.push('university=' + filters.university);
      if (filters.branch) query.push('branch=' + encodeURIComponent(filters.branch));
      if (filters.semester) query.push('semester=' + filters.semester);
      if (filters.year) query.push('year=' + filters.year);
      const res = await API.get('/papers?' + query.join('&'));
      setPapers(res.data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPapers(); }, [filters]);

  const clearFilters = () => {
    setFilters({ university: '', branch: '', semester: '', year: '' });
    setSearch('');
  };

  const hasFilters = Object.values(filters).some((v) => v !== '') || search !== '';

  const displayed = papers.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(s) ||
      p.subject.toLowerCase().includes(s) ||
      p.branch.toLowerCase().includes(s)
    );
  });

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto p-6">
        <div className="text-center mb-8 mt-4">
          <h1 className="text-3xl font-bold text-gray-800">Previous Year Question Papers</h1>
          <p className="text-gray-500 mt-2">Browse and download papers from DBATU and BAMU universities</p>
        </div>

        <div className="mb-4">
          <input
            className="border border-gray-300 w-full p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            placeholder="Search by subject, title, or branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <select
            className="border border-gray-300 p-2 rounded-lg text-sm bg-white"
            value={filters.university}
            onChange={(e) => setFilters((f) => ({ ...f, university: e.target.value }))}
          >
            <option value="">All Universities</option>
            <option value="DBATU">DBATU</option>
            <option value="BAMU">BAMU</option>
          </select>

          <select
            className="border border-gray-300 p-2 rounded-lg text-sm bg-white"
            value={filters.branch}
            onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>

          <select
            className="border border-gray-300 p-2 rounded-lg text-sm bg-white"
            value={filters.semester}
            onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}
          >
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map((s) => (
              <option key={s} value={String(s)}>Semester {s}</option>
            ))}
          </select>

          <select
            className="border border-gray-300 p-2 rounded-lg text-sm bg-white"
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
          >
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-500">
            Showing <strong>{displayed.length}</strong> paper{displayed.length !== 1 ? 's' : ''}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
              Clear Filters
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400 text-lg">Loading papers...</div>
        )}

        {!loading && displayed.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div style={{ fontSize: '4rem' }} className="mb-4">📄</div>
            <p className="text-lg font-medium text-gray-600">No papers found</p>
            <p className="text-sm mt-1">Try changing the filters or search terms</p>
          </div>
        )}

        {!loading && displayed.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {displayed.map((paper) => (
              <div
                key={paper._id}
                className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={
                    'text-xs font-semibold px-3 py-1 rounded-full ' +
                    (paper.university === 'DBATU' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')
                  }>
                    {paper.university}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{paper.year}</span>
                </div>

                <h2 className="font-bold text-gray-800 text-base mt-2 leading-snug">{paper.title}</h2>

                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-600">Subject: </span>{paper.subject}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-600">Branch: </span>{paper.branch}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-gray-600">Semester: </span>{paper.semester}
                  </p>
                  {paper.examType && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-600">Exam: </span>{paper.examType}
                    </p>
                  )}
                  {paper.course && (
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-600">Course: </span>{paper.course}
                    </p>
                  )}
                </div>

                <a
                  href={paper.filePath}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  ⬇ Download PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
