import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuthExportAccount } from '../../context/AuthExportAccountContext';
import Navbar from '../../components/Navbar';
import OrderExportTable from '../../components/OrderExportTable';
import LoginExportAccount from '../../components/ExportAccountLogin';

interface PageData {
  isLoaded: boolean
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const { userExportAccount, config } = useAuthExportAccount();

  const [pageData, setPageData] = useState<PageData>({
    isLoaded: false
  });

  useEffect(() => {
    setPageData(p => ({
      ...p,
      isLoaded: true
    }))
  }, []);

  if (!user) return <></>

  return (

    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mt-4">
        {/* Title */}
        <div className="row mb-4">
          <div className="col">
            <h1 className="h2">Exportador de pedidos</h1>
          </div>
        </div>


        {userExportAccount && pageData.isLoaded ? (
          <>
            {/* Orders Table */}
            <div className="card">
              <div className="card-body">
                <OrderExportTable key={user.profile} user={user} userToExport={userExportAccount} exportConfig={config} />
              </div>
            </div>
          </>
        ) : !userExportAccount && pageData.isLoaded ? (
          <>
            {/* Login export user */}
            <LoginExportAccount user={user} />
          </>
        ) : (
          // Loading state
          <div className="card">
            <div className="card-body">
              <div className="text-center">Loading...</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;