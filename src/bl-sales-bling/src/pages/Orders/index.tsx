import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

// Mock data - replace with actual API calls
const mockOrders = [
  { id: 1, product: 'Laptop', status: 'Delivered', date: '2024-01-15' },
  { id: 2, product: 'Phone', status: 'Processing', date: '2024-01-16' },
  { id: 3, product: 'Tablet', status: 'Shipped', date: '2024-01-14' },
];

const Orders: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Orders Page</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h2 className="text-xl font-semibold">Your Orders</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {mockOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{order.product}</h3>
                      <p className="text-gray-600">Order #{order.id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                      <p className="text-gray-500 text-sm mt-1">{order.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-600">
            <strong>Authentication Token:</strong> {user?.token}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Orders;