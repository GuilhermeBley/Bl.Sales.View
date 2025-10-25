import React, { useState, useEffect } from 'react';
import { OrderDataToExport } from '../../model/OrderDataToExport';
import { Modal, Button } from 'react-bootstrap';
import { PostOrderModel } from '../../services/orderService';

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
    onModalConfirmation }) => {

    const [show, setShow] = useState(false);
    const [storeNumber, setStoreNumber] = useState<number | undefined>(undefined);

    const handleClose = () => {
        setShow(false);
        if (onModalClose) onModalClose();
    }
    const handleShow = () => setShow(true);

    const handleConfirm = async () => {
        
        let postItems = orders
            .map(x => {
                const postOrder: PostOrderModel = {
                    sourceId: x.id,
                    customer: x.customer,
                    date: x.date,
                    orderStoreNumber: x.orderStoreNumber,
                    orderNumber: x.number,
                    original: x.original,
                    products: x.productsToExport,
                    profileSource: x.profile,
                    profileTarget: profileTarget,
                    storeId: storeNumber
                };

                return postOrder;
            });
        
        if (onModalConfirmation) await onModalConfirmation(postItems);
    }

    useEffect(() => {

        setShow(showModal)
    }, [showModal])

    if (orders.length == 0) return <></>

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirmação de exportação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Confirmação de exportação de {orders.length} pedidos.

                <div className="mb-3">
                    <label className="form-label">Número da loja</label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="storeNumber" 
                        placeholder="123"
                        value={storeNumber}
                        onChange={(e) => setStoreNumber(parseInt(e.target.value))}/>
                </div>
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