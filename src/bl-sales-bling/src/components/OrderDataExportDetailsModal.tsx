import React, { useState, useEffect } from 'react';
import { OrderDataToExport, OrderStatus } from '../model/OrderDataToExport';
import { Modal, Button } from 'react-bootstrap';

interface OrderDataExportDetailsModalInput {
    order?: OrderDataToExport | undefined,
    showModal: boolean,
    onModalClose?: () => void
}


const OrderDataExportDetailsModal: React.FC<OrderDataExportDetailsModalInput> = ({ order, showModal, onModalClose }) => {

    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
        if (onModalClose) onModalClose();
    }
    const handleShow = () => setShow(true);

    useEffect(() => {

        setShow(showModal)
    }, [showModal])

    const getOrderAlert = (status: OrderStatus, messages: string[]) => {


        switch (status) {
            case OrderStatus.CanBeExported:
                if (messages.length == 0) messages = ['Pedido pode ser exportado com sucesso!'];
                return <>
                    {messages.map((x, i) =>
                         <div className="alert alert-success" role="alert" key={i}>
                            {x}
                        </div>
                    )}
                    
                </>
            case OrderStatus.Exported:
                if (messages.length == 0) messages = ['Pedido já foi exportado anteriormente.'];
                return <>
                    {messages.map((x, i) =>
                         <div className="alert alert-success" role="alert" key={i}>
                            {x}
                        </div>
                    )}
                    
                </>
            case OrderStatus.StockEnouth:
                return <>
                    <div className="alert alert-success" role="alert">
                        Pedido já possuí estoque suficiente para operações.
                    </div>
                </>
            case OrderStatus.Error:
                return <>
                    <div className="alert alert-danger" role="alert">
                        Houve falhas no pedido, verifique-as.
                    </div>
                </>
            case OrderStatus.Loading:
                return <>
                    <div className="alert alert-info" role="alert">
                        Carregando...
                    </div>
                </>
            case OrderStatus.NotStartedYet:
                return <>
                    <div className="alert alert-warning" role="alert">
                        Pedido não vou validado ainda, utilize a opção 'Validar Exportação'.
                    </div>
                </>
            default:
                return <>
                    <div className="alert alert-info" role="alert">
                        Falha no carregamento...
                    </div>
                </>
        }
    }

    if (!order) return <></>

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Detalhes pedido {order.number}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {order.warnings.length > 0 || order.errors.length > 0
                    ? <>
                        {/*Error scenario*/}
                        <h4>Listagem de problemas encontrados</h4>
                        <ul className="list-group">
                            {order.errors.map(x => ({ message: x, kind: 'danger' }))
                                .concat(order.warnings.map(x => ({ message: x, kind: 'warning' })))
                                .map((x, i) => <>
                                    <li key={i} className={"list-group-item list-group-item-" + x.kind}>
                                        {x.message}
                                    </li>
                                </>)}
                        </ul>
                    </>
                    : <>
                    </>
                }
                
                {getOrderAlert(order.status, order.success)}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrderDataExportDetailsModal;