import { useAuth } from '../context/AuthContext';
import { useAuthExportAccount } from '../context/AuthExportAccountContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { userExportAccount, logoutExportAccount } = useAuthExportAccount();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    logout();
    logoutExportAccount()
    navigate('/login');
  };

  const handleLogoutJustExportAccount = (): void => {
    logoutExportAccount();
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
                    Perfil: {maskToken(user.profile)}
                  </span>
                </div>

                {/* Logout button */}
                <div className="nav-item">

                  <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    </button>
                    <ul className="dropdown-menu">
                      {userExportAccount
                      ? <>
                        <li><a className="dropdown-item" href="#" onClick={handleLogoutJustExportAccount}>Sair de conta de exportação</a></li>
                        <li><hr className="dropdown-divider" /></li>
                      </>
                      : <> {/** Hide elements */} </>}
                      <li><a className="dropdown-item text-danger" href="#" onClick={handleLogout}>Sair</a></li>
                    </ul>
                  </div>
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