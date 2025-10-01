import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    navigate('/login');
  };

  // Function to mask the token (show first 4 and last 4 characters)
  const maskToken = (token: string): string => {
    if (token.length <= 8) return '•'.repeat(token.length);
    return `${token.slice(0, 4)}${'•'.repeat(token.length - 8)}${token.slice(-4)}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        {/* Brand/Logo */}
        <Link className="navbar-brand" to="/">
          Facilitador Bling
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar content */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Navigation links - left side */}
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Início
              </Link>
            </li>
          </ul>

          {/* User info and logout - right side */}
          <div className="navbar-nav ms-auto">
            {user && (
              <>
                {/* Masked token display */}
                <div className="nav-item">
                  <span className="nav-link text-light">
                    Token: {maskToken(user.token)}
                  </span>
                </div>
                
                {/* Logout button */}
                <div className="nav-item">
                  <button
                    className="btn btn-outline-light btn-sm ms-2"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;