import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSourceOrders, postTargetOrder } from '../../services/orderService';
import Navbar from '../../components/Navbar';

interface PageData{
  isSubmitting: boolean,
  orders: any[]
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [ordersSelectedToExport, setOrdersSelectedToExport] = useState<number[]>([]);
  const [pageData, setPageData] = useState<PageData>({
    isSubmitting: false,
    orders: []
  });

  useEffect(() => {

    const getAndSetOrders = async () => {

      let orders = await getSourceOrders();

      setPageData(p => ({
        ...p,
        orders: orders
      }));
    }

    getAndSetOrders();

  }, []);

  const canSubmitOrders = () => {
    return ordersSelectedToExport.length > 0 &&
      pageData.isSubmitting === false;
  }

  const checkOrderButtonInfo = (order: any) => {
    // TODO : add a kind to the order
    if (pageData.isSubmitting) return {
      canCheck: false,
      buttonMessage: "Aguarde a importação finalizar..."
    };

    return {
      canCheck: true,
      buttonMessage: "Selecione para envio de exportação."
    }
  }

  // Toggle select all orders
  const handleSelectAll = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setOrdersSelectedToExport(pageData.orders.map(order => order.number));
    } else {
      setOrdersSelectedToExport([]);
    }
  };

  // Toggle individual order selection
  const handleOrderSelection = (orderNumber: number) => {
    setOrdersSelectedToExport(prev => {
      if (prev.includes(orderNumber)) {
        return prev.filter(num => num !== orderNumber);
      } else {
        return [...prev, orderNumber];
      }
    });
  };

  // Handle export to Bling
  const handleExportToBling = async () => {
    if (ordersSelectedToExport.length === 0) {
      alert('Por favor, selecione pelo menos um pedido para exportar.');
      return;
    }

    const selectedOrders = pageData.orders.filter(order => 
      ordersSelectedToExport.includes(order.number)
    );

    try
    {
      setPageData(p => ({
        ...p,
        isSubmitting: true
      }))

      for (let element of selectedOrders)
      {
        await postTargetOrder({
        // TODO: process items
        });

        element.Status = "Processed";
        setPageData(p => ({...p})); // refreshing the page
        setOrdersSelectedToExport(p => [...p.filter(x => x != element.number)])
      }
    }
    finally
    {
      setPageData(p => ({
        ...p,
        isSubmitting: false
      }))
    }
    
    // Here you would typically make an API call to Bling
    // For now, we'll just log to console and show an alert
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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

        {/* Orders Table */}
        <div className="card">
          <div className="card-body overflow-auto" style={{maxHeight: "60vh", height: "60vh"}}>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th scope="col" style={{ width: '50px' }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={ordersSelectedToExport.length === pageData.orders.length && pageData.orders.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th scope="col">Número do Pedido</th>
                    <th scope="col">Data do Pedido</th>
                    <th scope="col">Quantidade de Produtos</th>
                    <th scope="col">Nome do Cliente</th>
                    <th scope="col">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.orders.map(o => ({...o, checkBoxInfo: checkOrderButtonInfo(o)})).map((order) => (
                    <tr key={order.number}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={ordersSelectedToExport.includes(order.number)}
                          onChange={() => handleOrderSelection(order.number)}
                          disabled={order.checkBoxInfo.canCheck === false}
                          title={order.checkBoxInfo.buttonMessage}
                        />
                      </td>
                      <td>{order.number}</td>
                      <td>{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                      <td>{order.products.length}</td>
                      <td>{order.customer.name}</td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="row mt-4">
          <div className="col text-end">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleExportToBling}
              disabled={canSubmitOrders() === false}
            >
              Exportar para o Bling ({ordersSelectedToExport.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;