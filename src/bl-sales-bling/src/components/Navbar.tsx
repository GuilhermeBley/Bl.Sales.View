import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-6">
          <Link to="/" className="hover:text-blue-200 font-semibold">
            Home
          </Link>
          <Link to="/orders" className="hover:text-blue-200 font-semibold">
            Orders
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Welcome! Token: {user?.token.substring(0, 10)}...</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;