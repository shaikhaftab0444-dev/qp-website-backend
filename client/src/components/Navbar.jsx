import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-700">
        QP Portal
      </Link>
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">
          Home
        </Link>
        {token ? (
          <>
            <Link to="/admin" className="text-sm text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Admin Login
          </Link>
        )}
      </div>
    </nav>
  );
}
