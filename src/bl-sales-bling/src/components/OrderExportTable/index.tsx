import { useEffect, useState, useCallback, useRef } from 'react';
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
    const [componentData, setComponentData] = useState<PageData>({
        isSubmitting: false,
        orders: [],
        ordersSelectedToExport: []
    });

    // Use useRef to track if data has been loaded
    const hasLoaded = useRef(false);

    useEffect(() => {
        // Early returns to prevent double execution
        if (!user || hasLoaded.current) return;

        const getAndSetOrders = async () => {
            hasLoaded.current = true; // Mark as loaded immediately
            console.log(`Loading orders from profile ${user.profile}`);

            try {
                let orders = await getSourceOrders(user.profile, user.key);
                setComponentData(p => ({
                    ...p,
                    orders: orders
                }));
            } catch (error) {
                console.error('Failed to load orders:', error);
                hasLoaded.current = false;
            }
        }

        getAndSetOrders();

        return () => {
            hasLoaded.current = false;
        };
    }, [user]); // Add user as dependency

    // Memoize the checkOrderButtonInfo function
    const checkOrderButtonInfo = useCallback((order: any) => {
        if (componentData.isSubmitting) return {
            canCheck: false,
            buttonMessage: "Aguarde a importação finalizar..."
        };

        return {
            canCheck: true,
            buttonMessage: "Selecione para envio de exportação."
        };
    }, [componentData.isSubmitting]);

    const canSubmitOrders = useCallback(() => {
        return componentData.ordersSelectedToExport.length > 0 &&
            componentData.isSubmitting === false;
    }, [componentData.ordersSelectedToExport.length, componentData.isSubmitting]);

    const setOrdersSelectedToExport = useCallback((ordersToExport: number[]) => {
        setComponentData(p => ({
            ...p,
            ordersSelectedToExport: ordersToExport
        }));
    }, []);

    // Memoize the select all handler
    const handleSelectAll = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setOrdersSelectedToExport(componentData.orders
                .filter(order => order.status === OrderStatus.CanBeExported)
                .map(order => order.number));
        } else {
            setOrdersSelectedToExport([]);
        }
    }, [componentData.orders, setOrdersSelectedToExport]);

    // Memoize individual order selection
    const handleOrderSelection = useCallback((orderNumber: number) => {
        setComponentData(p => {
            const prev = p.ordersSelectedToExport;
            let newSelection;
            if (prev.includes(orderNumber)) {
                newSelection = prev.filter(num => num !== orderNumber);
            } else {
                newSelection = [...prev, orderNumber];
            }
            return {
                ...p,
                ordersSelectedToExport: newSelection
            };
        });
    }, []);

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
            }));

            // Process orders sequentially
            for (let element of selectedOrders) {
                if (element.status == OrderStatus.Exported) continue;

                await postTargetOrder({
                    // TODO: process items
                });

                // Update the order status in the local state
                setComponentData(p => ({
                    ...p,
                    orders: p.orders.map(order =>
                        order.number === element.number
                            ? { ...order, status: OrderStatus.Exported }
                            : order
                    ),
                    ordersSelectedToExport: p.ordersSelectedToExport.filter(x => x !== element.number)
                }));
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Erro ao exportar pedidos. Tente novamente.');
        } finally {
            setComponentData(p => ({
                ...p,
                isSubmitting: false
            }));
        }
    };

    // Format currency - memoize if it becomes expensive
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const renderStatusCell = (order: OrderDataToExport) => {
        const checkBoxInfo = checkOrderButtonInfo(order);
        switch (order.status) {
            case OrderStatus.CanBeExported:
                return (
                    <input
                        type="checkbox"
                        className="form-check-input"
                        checked={componentData.ordersSelectedToExport.includes(order.number)}
                        onChange={() => handleOrderSelection(order.number)}
                        disabled={!checkBoxInfo.canCheck}
                        title={checkBoxInfo.buttonMessage}
                    />
                );
            case OrderStatus.Loading:
                return <i className="fa-solid fa-spinner fa-spin"></i>;
            case OrderStatus.Exported:
            default:
                return <i className="fa-solid fa-check"></i>;
        }
    };

    // Early return after hooks
    if (!user) return <></>;

    return (
        <div>
            <div className="table-responsive overflow-auto" style={{ maxHeight: "60vh", height: "60vh" }}>
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
                            <th scope="col">Status</th>
                            <th scope="col">Número do Pedido</th>
                            <th scope="col">Data do Pedido</th>
                            <th scope="col">Quantidade de Produtos</th>
                            <th scope="col">Nome do Cliente</th>
                            <th scope="col">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {componentData.orders.map((order) => {
                            return (
                                <tr key={order.number}>
                                    <td>{renderStatusCell(order)}</td>
                                    <td>{order.statusMessage}</td>
                                    <td>{order.number}</td>
                                    <td>{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                    <td>{order.products.length}</td>
                                    <td>{order.customer.name}</td>
                                    <td>{formatCurrency(order.totalPrice)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

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
                                disabled={!canSubmitOrders()}
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