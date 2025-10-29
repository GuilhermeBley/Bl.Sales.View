// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuthProviderExportAccount } from './context/AuthExportAccountContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import Orders from './pages/Orders';
import RedirectAuth from './pages/RedirectAuth';

function App() {
  return (
    <AuthProvider>
      <AuthProviderExportAccount>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/redirect-login"
                element={
                    <RedirectAuth />
                }
              />
              
              {/* Redirect any unknown routes to home */}
              <Route path="*" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            </Routes>
          </div>
        </Router>
      </AuthProviderExportAccount>
    </AuthProvider>
  );
}

export default App;