import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useAuthExportAccount } from '../../context/AuthExportAccountContext';
import LazySelect, { SelectOption } from '../LazySelect';

interface OrderExportConfigModalInput {
    showModal: boolean,
    targetProfile: string,
    onModalClose?: () => void,
    loadStores?: () => Promise<SelectOption[]>,
    loadSituacoes?: () => Promise<SelectOption[]>,
    loadCompanies?: () => Promise<SelectOption[]>,
}


const OrderExportConfigModal: React.FC<OrderExportConfigModalInput> = ({
    showModal,
    onModalClose,
    loadStores,
    loadSituacoes,
    loadCompanies
}) => {

    const [show, setShow] = useState(false);
    const { config, setExportConfig } = useAuthExportAccount();

    const handleClose = () => {
        setShow(false);
        if (onModalClose) onModalClose();
    }

    useEffect(() => {

        setShow(showModal)
    }, [showModal])

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Configuração de exportação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Configuração de exportação de pedidos.</p>

                <div className="mb-3">
                    {loadStores
                        ? 
                        <div className="mb-3">
                            <label className="form-label">Loja padrão</label>
                            
                            <LazySelect
                                loadOptions={loadStores}
                                value={config.defaultStoreId}
                                onChange={(n) => setExportConfig(typeof n === 'number' ? n : undefined, config.defaultSituacaoId, config.staticCustomerCnpj)}
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
                                onChange={(n) => setExportConfig(config.defaultStoreId, typeof n === 'number' ? n : undefined, config.staticCustomerCnpj)}
                                placeholder="Clique para carregar as situações..."
                                />
                        </div>
                        : <></>
                    }

                    {loadCompanies
                        ? 
                        <div className="mb-3">
                            <label className="form-label">Empresa padrão (caso campo for setado, será permitido )</label>
                            
                            <LazySelect
                                loadOptions={loadCompanies}
                                value={config.staticCustomerCnpj}
                                onChange={(n) => setExportConfig(config.defaultStoreId, config.defaultSituacaoId, typeof n === 'string' ? n : undefined)}
                                placeholder="Clique para carregar as empresas..."
                                />
                        </div>
                        : <></>
                    }
                    
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Fechar
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default OrderExportConfigModal;