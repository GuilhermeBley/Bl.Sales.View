import React, { useState, useEffect } from 'react';
import { OrderDataToExport, OrderStatus } from '../../model/OrderDataToExport';
import { Modal, Button } from 'react-bootstrap';
import { PostOrderModel } from '../../services/orderService';
import { useAuthExportAccount } from '../../context/AuthExportAccountContext';

interface OrderExportConfirmationModalInput {
    orders: OrderDataToExport[],
    showModal: boolean,
    profileTarget: string,
    onModalClose?: () => void,
    onModalConfirmation?: (orders: PostOrderModel[]) => Promise<void>
}


const OrderExportConfirmationModal: React.FC<OrderExportConfirmationModalInput> = ({
    orders,
    showModal,
    profileTarget,
    onModalClose,
    onModalConfirmation,
}) => {

    const [show, setShow] = useState(false);
    const { config } = useAuthExportAccount();

    const handleClose = () => {
        setShow(false);
        if (onModalClose) onModalClose();
    }
    const handleShow = () => setShow(true);

    const handleConfirm = async () => {

        let invalidCustomersOrders = orders
            .filter(x => {
                if (config.staticCustomerCnpj
                    && x.defaultCustomer?.documentNumber != config.staticCustomerCnpj)
                {
                    x.status = OrderStatus.Error;
                    x.errors.push(`Cliente padrão ${config.staticCustomerCnpj} não foi colocado para o pedido.`);
                    console.error(`Invaldi default customer CNPJ ${config.staticCustomerCnpj} for order ${x.id}.`);
                    return true;
                }
                x.defaultCustomer = undefined;
                return false;
            });

        if (invalidCustomersOrders.length > 0) {
            handleClose();
            return;
        }

        let postItems = orders
            .map(x => {

                const postOrder: PostOrderModel = {
                    sourceId: x.id,
                    customer: x.defaultCustomer ?? x.customer,
                    date: x.date,
                    orderStoreNumber: x.orderStoreNumber,
                    orderNumber: x.number,
                    original: x.original,
                    products: x.productsToExport,
                    profileSource: x.profile,
                    profileTarget: profileTarget,
                    storeId: config.defaultStoreId,
                    situacaoId: config.defaultSituacaoId
                };

                return postOrder;
            });

        if (onModalConfirmation) await onModalConfirmation(postItems);
    }

    useEffect(() => {

        setShow(showModal)
    }, [showModal])

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirmação de exportação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Confirmação de exportação de {orders.length} pedidos.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleConfirm}>
                    Confirmar
                </Button>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrderExportConfirmationModal;