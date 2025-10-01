import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    setError('');

    // Basic token validation
    if (!token.trim()) {
      setError('Please enter a token');
      return;
    }

    if (token.length < 10) {
      setError('Token must be at least 10 characters long');
      return;
    }

    // Login user
    login(token);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm mt-5">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">Login</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="token" className="form-label">
                    Token
                  </label>
                  <input
                    type="password"
                    className={`form-control ${error ? 'is-invalid' : ''}`}
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter your token"
                    aria-describedby="tokenHelp"
                  />
                  {error && (
                    <div className="invalid-feedback">
                      {error}
                    </div>
                  )}
                  <div id="tokenHelp" className="form-text">
                    Your token must be at least 10 characters long.
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={!token.trim()}
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;