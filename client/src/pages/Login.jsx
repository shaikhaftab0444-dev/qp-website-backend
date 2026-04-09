import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.token);
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm">

        <div className="text-center mb-6">
          <div style={{ fontSize: '2.5rem' }}>🔐</div>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Admin Login</h2>
          <p className="text-sm text-gray-500 mt-1">Access the question paper dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@gmail.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="border border-gray-300 w-full p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
