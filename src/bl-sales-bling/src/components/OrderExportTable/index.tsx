
import { useEffect, useState } from 'react';
import { OrderDataToExport, OrderStatus } from '../../model/OrderDataToExport';
import { User } from '../../model/auth';
import { getSourceOrders, postTargetOrder } from '../../services/orderService';

interface PageData {
    isSubmitting: boolean,
    orders: OrderDataToExport[],
    ordersSelectedToExport: number[],
}

interface InputPageData {
    user: User,
    userToExport: User,
}

const OrderExportTable: React.FC<InputPageData> = ({ user }) => {

    if (!user) return <></>

    const [componentData, setComponentData] = useState<PageData>({
        isSubmitting: false,
        orders: [],
        ordersSelectedToExport: []
    });

    useEffect(() => {

        const getAndSetOrders = async () => {

            if (!user) return;

            let orders = await getSourceOrders(user.profile, user.key);

            setComponentData(p => ({
                ...p,
                orders: orders
            }));
        }

        getAndSetOrders();

    }, []);
    const canSubmitOrders = () => {
        return componentData.ordersSelectedToExport.length > 0 &&
            componentData.isSubmitting === false;
    }

    const setOrdersSelectedToExport = (ordersToExport: number[]) => {
        setComponentData(p => ({
            ...p,
            ordersSelectedToExport: ordersToExport
        }));
    }

    const checkOrderButtonInfo = (order: any) => {
        // TODO : add a kind to the order
        if (componentData.isSubmitting) return {
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
            setOrdersSelectedToExport(componentData.orders
                .filter(order => order.status === OrderStatus.CanBeExported)
                .map(order => order.number));
        } else {
            setOrdersSelectedToExport([]);
        }
    };

    // Toggle individual order selection
    const handleOrderSelection = (orderNumber: number) => {
        let prev = componentData.ordersSelectedToExport;
        if (prev.includes(orderNumber)) {
            prev = prev.filter(num => num !== orderNumber);
        } else {
            prev = [...prev, orderNumber];
        }
        setOrdersSelectedToExport(prev);
    };

    // Handle export to Bling
    const handleExportToBling = async () => {
        if (componentData.ordersSelectedToExport.length === 0) {
            alert('Por favor, selecione pelo menos um pedido para exportar.');
            return;
        }

        const selectedOrders = componentData.orders.filter(order =>
            componentData.ordersSelectedToExport.includes(order.number)
        );

        try {
            setComponentData(p => ({
                ...p,
                isSubmitting: true
            }))

            for (let element of selectedOrders) {
                if (element.status == OrderStatus.Exported) continue;

                await postTargetOrder({
                    // TODO: process items
                });

                element.status = OrderStatus.Exported;
                setComponentData(p => ({ 
                    ...p,
                    // removing already processed one
                    ordersSelectedToExport: [...p.ordersSelectedToExport.filter(x => x != element.number)]
                }));
            }
        }
        finally {
            setComponentData(p => ({
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
        <div>
            <table className="table table-striped table-hover">
                <thead className="table-dark">
                    <tr>
                        <th scope="col" style={{ width: '50px' }}>
                            <input
                                type="checkbox"
                                className="form-check-input"
                                checked={componentData.ordersSelectedToExport.length === componentData.orders.length && componentData.orders.length > 0}
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
                    {componentData.orders.map(o => ({ ...o, checkBoxInfo: checkOrderButtonInfo(o) })).map((order) => (
                        <tr key={order.number}>

                            {order.status === OrderStatus.CanBeExported
                                ? <td>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={componentData.ordersSelectedToExport.includes(order.number)}
                                        onChange={() => handleOrderSelection(order.number)}
                                        disabled={order.checkBoxInfo.canCheck === false}
                                        title={order.checkBoxInfo.buttonMessage}
                                    />
                                </td>
                                : <td><i className="fa-solid fa-check"></i></td>}

                            <td>{order.number}</td>
                            <td>{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                            <td>{order.products.length}</td>
                            <td>{order.customer.name}</td>
                            <td>{formatCurrency(order.totalPrice)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Export Button */}
            <div className="row mt-4">
                <div className="col text-end">
                    {componentData.isSubmitting
                        ? <>
                            <button className="btn btn-primary btn-lg" disabled>
                                Exportar para o Bling <i className="fa-solid fa-arrow-rotate-right fa-spin"></i>
                            </button>
                        </>
                        : <>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleExportToBling}
                                disabled={canSubmitOrders() === false}
                            >
                                Exportar para o Bling ({componentData.ordersSelectedToExport.length})
                            </button>
                        </>}
                </div>
            </div>
        </div>
    );
}

export default OrderExportTable;