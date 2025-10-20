import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAuthExportAccount } from '../../context/AuthExportAccountContext';
import Navbar from '../../components/Navbar';
import OrderExportTable from '../../components/OrderExportTable';
import LoginExportAccount from '../../components/ExportAccountLogin';

interface PageData {
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const { userExportAccount } = useAuthExportAccount();

  const [pageData, setPageData] = useState<PageData>({

  });

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


        {userExportAccount
        ? <>
          {/* Orders Table */}
          <div className="card">
            <div className="card-body overflow-auto" style={{ maxHeight: "60vh", height: "60vh" }}>
              <div className="table-responsive">
                <OrderExportTable user={user} userToExport={userExportAccount}/>
              </div>
            </div>
          </div>
        </>
        : <>
          {/* Login export user */}
          <LoginExportAccount user={user}/>
        </>}

      </div>
    </div>
  );
};

export default Home;