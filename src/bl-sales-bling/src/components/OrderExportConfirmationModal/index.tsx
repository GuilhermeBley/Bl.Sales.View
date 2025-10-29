import React, { useState, useEffect } from 'react';
import { OrderDataToExport } from '../../model/OrderDataToExport';
import { Modal, Button } from 'react-bootstrap';
import { PostOrderModel } from '../../services/orderService';
import { useAuthExportAccount } from '../../context/AuthExportAccountContext';
import LazySelect, { SelectOption } from '../LazySelect';

interface OrderExportConfirmationModalInput {
    orders: OrderDataToExport[],
    showModal: boolean,
    profileTarget: string,
    onModalClose?: () => void,
    onModalConfirmation?: (orders: PostOrderModel[]) => Promise<void>
    loadStores?: () => Promise<SelectOption[]>,
    loadSituacoes?: () => Promise<SelectOption[]>,
}


const OrderExportConfirmationModal: React.FC<OrderExportConfirmationModalInput> = ({
    orders,
    showModal,
    profileTarget,
    onModalClose,
    onModalConfirmation,
    loadStores,
    loadSituacoes,
}) => {

    const [show, setShow] = useState(false);
    const [storeNumber, setStoreNumber] = useState<number | undefined>(undefined);
    const { config, setExportConfig } = useAuthExportAccount();

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

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirmação de exportação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Confirmação de exportação de {orders.length} pedidos.</p>

                <div className="mb-3">
                    {loadStores
                        ? 
                        <div className="mb-3">
                            <label className="form-label">Loja padrão</label>
                            
                            <LazySelect
                                loadOptions={loadStores}
                                value={config.defaultStoreId}
                                onChange={(n) => setExportConfig(typeof n === 'number' ? n : undefined, config.defaultSituacaoId)}
                                placeholder="Clique para carregar as lojas..."
                                />
                        </div>
                        : <></>
                    }

                    {loadSituacoes
                        ? 
                        <div className="mb-3">
                            <label className="form-label">Situação padrão</label>
                            
                            <LazySelect
                                loadOptions={loadSituacoes}
                                value={config.defaultSituacaoId}
                                onChange={(n) => setExportConfig(config.defaultStoreId, typeof n === 'number' ? n : undefined)}
                                placeholder="Clique para carregar as lojas..."
                                />
                        </div>
                        : <></>
                    }
                    
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