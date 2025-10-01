import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Home Page</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome to your dashboard!</h2>
          <p className="text-gray-600 mb-4">
            You are successfully logged in with your token.
          </p>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-sm font-mono break-all">
              <strong>Your Token:</strong> {user?.token}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;