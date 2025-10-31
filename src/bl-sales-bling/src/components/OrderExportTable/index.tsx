import { useEffect, useState, useCallback, useRef } from 'react';
import { CustomerInfo, OrderDataToExport, OrderStatus, ProductInfo } from '../../model/OrderDataToExport';
import { User } from '../../model/auth';
import { createCustomer, getOrders, getProducts, PostOrderModel, postTargetOrder, getCustomer } from '../../services/orderService';
import LoadingComponent from '../LoadingComponent';
import OrderDataExportDetailsModal from '../OrderDataExportDetailsModal';
import OrderExportConfirmationModal from '../OrderExportConfirmationModal';
import AbsoluteLoadingComponent from '../AbsoluteLoadingComponent';
import { getCompanies, getSituacoes, getStores } from './service';
import { OrderExportConfig } from '../../model/OrderExportConfig';
import OrderExportConfigModal from '../OrderExportConfigModal';

interface PageData {
    isSubmitting: boolean,
    orders: OrderDataToExport[],
    products: ProductInfo[],
    productsToExport: ProductInfo[],
    ordersSelectedToExport: OrderDataToExport[],
    selectedDate: Date,
    isLoadingOrders: boolean,
    isValidatingData: boolean
}

interface InputPageData {
    user: User,
    userToExport: User,
    exportConfig: OrderExportConfig
}

const getDefaultDate = () => {
    const currentDate = new Date();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(currentDate.getDate() - 3);
    return threeDaysAgo;
}

const OrderExportTable: React.FC<InputPageData> = ({ user, userToExport, exportConfig }) => {
    const [componentData, setComponentData] = useState<PageData>({
        isSubmitting: false,
        orders: [],
        products: [],
        productsToExport: [],
        ordersSelectedToExport: [],
        selectedDate: getDefaultDate(),
        isLoadingOrders: true,
        isValidatingData: false
    });
    const [modalSelectedOrder, setModalSelectedOrder] = useState<OrderDataToExport | undefined>(undefined);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showExportConfigModal, setShowExportConfigModal] = useState(false);
    const [defaultCustomer, setDefaultCustomer] = useState<CustomerInfo | undefined>(undefined);
    const defaultCustomerRef = useRef(defaultCustomer);

    // Use useRef to track if data has been loaded
    const hasLoaded = useRef(false);

    useEffect(() => {
        // Early returns to prevent double execution
        if (!user || hasLoaded.current) return;

        getAndSetOrders();

        return () => {
            hasLoaded.current = false;
        };
    }, [user]);

    const canSubmitOrders = useCallback(() => {
        return componentData.isValidatingData === false &&
            componentData.ordersSelectedToExport.length > 0 &&
            componentData.isSubmitting === false;
    }, [componentData.ordersSelectedToExport.length, componentData.isSubmitting]);

    const setOrdersSelectedToExport = useCallback((ordersToExport: OrderDataToExport[]) => {
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
                .map(order => order));
        } else {
            setOrdersSelectedToExport([]);
        }
    }, [componentData.orders, setOrdersSelectedToExport]);

    // Memoize individual order selection
    const handleOrderSelection = useCallback((orderNumber: OrderDataToExport) => {
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
    const handleExportToBling = async (orders: PostOrderModel[]) => {
        if (orders.length === 0) {
            alert('Por favor, selecione pelo menos um pedido para exportar.');
            return;
        }
        setShowExportModal(false);

        try {
            let ordersToExportCopy = componentData.ordersSelectedToExport;

            setComponentData(p => ({
                ...p,
                ordersSelectedToExport: [],
                isSubmitting: true
            }));

            // Process orders sequentially
            for (let element of orders) {
                try {
                    let itemToProcess = ordersToExportCopy.find(x => x.number === element.orderNumber);

                    if (!itemToProcess) {
                        // TODO: Handle errors here
                        console.error(`Failed to find order to process: ${element.orderNumber}`)
                        continue;
                    }

                    if (!exportConfig.staticCustomerCnpj) {
                        //
                        // Try to create the customer if it wasn't set a default one.
                        //
                        let customerFound
                            = await createCustomer(element.customer, userToExport.profile, userToExport.key);

                        if (!customerFound.success) {
                            itemToProcess.errors.push(`Falha ao criar cliente ${element.customer.documentNumber}.`);
                            itemToProcess.status = OrderStatus.Error;
                            setComponentData(p => ({ ...p }))
                            continue;
                        }

                        element.customer.original = customerFound.data;
                    }

                    console.debug('Processing item: ')
                    console.debug(element)

                    let response = await postTargetOrder(element, userToExport.key);

                    if (response.success === false) {
                        console.error(response.data)
                        itemToProcess.success.push(`Falha ao criar pedido. (${element.orderNumber})`)
                        itemToProcess.status = OrderStatus.Error;
                        setComponentData(p => ({ ...p }))
                        return;
                    }

                    itemToProcess.success.push('Pedido criado com sucesso.')
                    itemToProcess.status = OrderStatus.Exported;
                    setComponentData(p => ({ ...p }))

                }
                catch (error) {
                    // TODO: Handle errors here
                    console.error(`Failed to proccess at: ${element.orderNumber}`, error)
                }
            }
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
        switch (order.status) {
            case OrderStatus.StockEnouth:
                return <span className="badge bg-success" title='O estoque da loja já é suficiente para este pedido.'>Estoque OK</span>;
            case OrderStatus.CanBeExported:
                return <span className="badge bg-primary" title='Pronto para exportação.'>Exportação pronta</span>;
            case OrderStatus.NotStartedYet:
                return <span className="badge bg-warning" title='Não verificado, clique no botão "Validar Exportação".'>Não Validado</span>;
            case OrderStatus.Loading:
                return <span className="badge bg-info" title='Carregando...'>Carregando...</span>;
            case OrderStatus.Exported:
                return <span className="badge bg-success" title='Pedido já exportado'>Exportado</span>;
            default:
                return <span className="badge bg-danger" title='Ocorreu um erro no processamento.'>Erro</span>;
        }
    };

    const getMinDate = () => {
        const today = new Date();
        const oneWeekLater = new Date(today);
        oneWeekLater.setDate(today.getDate() - 7);
        return oneWeekLater.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getDateRangeText = () => {
        const minDate = componentData.selectedDate.toISOString().split('T')[0];
        const maxDate = getMaxDate();

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            date.setHours(date.getHours() + 3);
            return date.toLocaleDateString('pt-BR');
        };

        return `${formatDate(minDate)} à ${formatDate(maxDate)}`;
    };

    const handleDateChange = (event: any) => {
        const selectedDate = event.target.value;

        let date = new Date(selectedDate)
        console.log('Date changed to ' + selectedDate);
        setComponentData(prev => ({
            ...prev,
            selectedDate: date
        }));

        getAndSetOrders(date);
    };

    const getAndSetOrders = async (date: Date | undefined = undefined) => {
        setComponentData(p => ({
            ...p,
            isLoadingOrders: true
        }));
        console.log(`Loading orders from profile ${user.profile}`);

        try {
            date ??= componentData.selectedDate;
            let orders = await getOrders(user.profile, user.key, date);
            setComponentData(p => ({
                ...p,
                orders: orders,
                ordersSelectedToExport: [],
                isLoadingOrders: false
            }));
        } catch (error) {
            console.error('Failed to load orders:', error);
            hasLoaded.current = false;
        }
    }

    const getAndSetSourceProducts = async () => {
        setComponentData(p => ({
            ...p,
            products: []
        }))

        const nutylacStockId = 14888569106; /** TODO: do a modal to configure this const */
        let products = await getProducts(user.profile, user.key, undefined, nutylacStockId);
        componentData.products.push(...products);
        setComponentData(p => ({ ...p }))
        return true;
    }

    const getAndSetTargetProducts = async () => {
        setComponentData(p => ({
            ...p,
            productsToExport: []
        }))

        let products = await getProducts(
            userToExport.profile,
            userToExport.key,
            exportConfig.defaultStoreId?.toString());
        componentData.productsToExport.push(...products)
        setComponentData(p => ({ ...p }))
        return true;
    }

    const getAndSetDefaultCustomer = async () => {
        if (!exportConfig.staticCustomerCnpj) return true;

        try {
            let customer =
                await getCustomer(userToExport.profile, userToExport.key, exportConfig.staticCustomerCnpj);

            if (customer) {
                console.log('Default customer set: ' + customer.id)
                setDefaultCustomer(customer);
                return true;
            }
        } catch {
            console.error(`Failed to get `)
        }

        return false;
    }

    const handleCheckAllOrders = async () => {

        try {
            componentData.orders.forEach(x => x.resetStatus())
            setComponentData(p => ({
                ...p,
                isValidatingData: true
            }))

            let results =
                await Promise.all([getAndSetSourceProducts(), getAndSetTargetProducts(), getAndSetDefaultCustomer()]);

            if (results[2] === false) {
                componentData.orders.forEach(element => {
                    element.status = OrderStatus.Error;
                    element.errors.push(`Falha ao coletar cliente padrão '${exportConfig.staticCustomerCnpj}'.`);
                });
                return;
            }

            if (componentData.products.length === 0) {
                // TODO: add error message here
                console.error(`No one product were found for profile '${user.profile}'.`);
                return;
            }
            if (componentData.productsToExport.length === 0) {
                // TODO: add error message here
                console.error(`No one product were found for profile '${userToExport.profile}'.`);
                return;
            }

            console.log('Default customer: ' + defaultCustomer?.documentNumber)
            for (let i = 0; i < componentData.orders.length; i++) {
                let order = componentData.orders[i];
                order.resetStatus();
                await order.processStatus(
                    componentData.products,
                    componentData.productsToExport,
                    defaultCustomer);

                setComponentData(p => ({ ...p, })) // updating screen
            }
        }
        finally {

            setComponentData(p => ({
                ...p,
                isValidatingData: false
            }))
        }
    }

    // Early return after hooks
    if (!user) return <></>;

    if (componentData.isLoadingOrders)
        return <LoadingComponent />

    const isDevelopment = process.env.NODE_ENV === 'development';
    return (
        <div>
            {/* Header Section */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h5 className="card-title mb-1">Pedidos</h5>
                            <p className="text-muted mb-0">
                                Total: {componentData.orders.length} pedidos |
                                Selecionados: {componentData.ordersSelectedToExport.length} |
                                Disponível para exportação: {componentData.orders.filter(order => order.status === OrderStatus.CanBeExported).length}
                            </p>

                            {isDevelopment
                                ? <>
                                    <button
                                        className="btn btn-outline-secondary"
                                        title="Atualizar lista"
                                        onClick={() => setShowExportConfigModal(true)}>
                                        <i className="bi bi-gear-fill"></i>
                                    </button>
                                </>
                                : <></>}

                        </div>
                        <div className="col-md-6 text-md-end">
                            <div className="input-group" role="group">
                                <input
                                    type="date"
                                    className="form-control"
                                    id="orderDate"
                                    value={componentData.selectedDate.toISOString().split('T')[0] || ''}
                                    onChange={handleDateChange}
                                    min={getMinDate()}
                                    max={getMaxDate()}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-outline-secondary"
                                        title="Atualizar lista"
                                        onClick={handleCheckAllOrders}
                                        disabled={componentData.isValidatingData}>
                                        <i className="fa-solid fa-rotate"></i> Validar Exportação
                                    </button>
                                </div>
                            </div>
                            <div className="form-text">
                                Período disponível: {getDateRangeText()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-responsive overflow-auto" style={{ maxHeight: "55vh", height: "55vh" }}>
                {componentData.isLoadingOrders
                    ? <AbsoluteLoadingComponent />
                    : componentData.orders.length === 0
                        ? <>
                            <div className="text-center py-5">
                                <i className="bi bi-inbox fs-1 text-muted"></i>
                                <p className="text-muted mt-3">Nenhum pedido encontrado</p>
                            </div>
                        </>
                        : <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col" style={{ width: '50px' }}>
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={false}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Número do Pedido</th>
                                    <th scope="col">Data do Pedido</th>
                                    <th scope="col">Quantidade de Produtos</th>
                                    <th scope="col">Nome do Cliente</th>
                                    <th scope="col">Valor</th>
                                    <th scope="col" title='Valor calculado após validação. Normalmente alterado quando uma loja atribuí um valor distinto para o produto.'>Valor Final</th>
                                </tr>
                            </thead>
                            <tbody>
                                {componentData.orders.map((order) => {
                                    return (
                                        <tr key={order.number}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    disabled={order.status !== OrderStatus.CanBeExported || componentData.isSubmitting}
                                                    checked={componentData.ordersSelectedToExport.includes(order)}
                                                    onChange={() => handleOrderSelection(order)}
                                                />
                                            </td>
                                            <td>
                                                <a href="#" role="button" onClick={() => { setModalSelectedOrder(order) }}>
                                                    {renderStatusCell(order)}
                                                </a>
                                            </td>
                                            <td>{order.number}</td>
                                            <td>{new Date(order.date).toLocaleDateString('pt-BR')}</td>
                                            <td>
                                                <span title={order.productsToExport.map(x => `${x.code} - ${x.description}`).join('\n')}>
                                                    {order.products.length == 0 ? '-' : order.products.length}
                                                </span>
                                            </td>
                                            <td>
                                                {order.customer.name}{order.defaultCustomer
                                                    ? <>
                                                        <i className="bi bi-three-dots" title={`Cnpj para exportação: ${order.defaultCustomer.documentNumber}`}></i>
                                                    </>
                                                    : <>
                                                    </>}
                                            </td>
                                            <td>{formatCurrency(order.totalPrice)}</td>
                                            <td>{order.finalValue ? formatCurrency(order.finalValue) : '-'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                }
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
                                onClick={() => setShowExportModal(true)}
                                disabled={!canSubmitOrders()}
                            >
                                Exportar para o Bling ({componentData.ordersSelectedToExport.length})
                            </button>
                        </>}
                </div>
            </div>


            <OrderDataExportDetailsModal
                order={modalSelectedOrder}
                showModal={modalSelectedOrder !== undefined}
                onModalClose={() => setModalSelectedOrder(undefined)} />

            <OrderExportConfirmationModal
                orders={componentData.ordersSelectedToExport}
                profileTarget={userToExport.profile}
                showModal={showExportModal}
                onModalClose={() => setShowExportModal(false)}
                onModalConfirmation={handleExportToBling}
            />


            <OrderExportConfigModal
                targetProfile={userToExport.profile}
                showModal={showExportConfigModal}
                onModalClose={() => setShowExportConfigModal(false)}
                loadSituacoes={() => getSituacoes(userToExport.profile, userToExport.key)}
                loadStores={() => getStores(userToExport.profile, userToExport.key)}
                loadCompanies={() => getCompanies(userToExport.profile, userToExport.key)}
            />
        </div>
    );
}

export default OrderExportTable;