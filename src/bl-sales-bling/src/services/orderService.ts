
import { data } from 'react-router-dom';
import { OrderDataToExport, OrderStatus, ProductInfo, CustomerInfo } from '../model/OrderDataToExport';
import api from './apiService'

interface PostOrderModel {

}

export const postTargetOrder = async (order: PostOrderModel) => {
    await new Promise(resolve => setTimeout(resolve, 1_000)); // fake loading

    console.log('Processing order.')
    return {
        orderCode: crypto.randomUUID()
    }
}

export const getOrders = async (profile: string, key: string, date: Date | undefined = undefined): Promise<OrderDataToExport[]> => {
    let result = await api.get(`/api/profile/${profile}/order?accountSecret=${key}&initialDate=${date?.toISOString().split('T')[0]}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data.data) === false) {
                throw new Error("Failed to get data.");
            }

            return data.data.map((x: any) => createOrderFromJson(x, profile, key));
        })
        .catch(error => {
            console.error(error)
            return [];
        });

    return result;
}

export const getCustomer = async (profile: string, key: string, documentNumber: string): Promise<CustomerInfo | undefined> => {
    let result = await api.get(`/api/profile/${profile}/product?accountSecret=${key}&documentNumber=${documentNumber}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data.data) === false) {
                throw new Error("Failed to get data.");
            }

            if (data.data.length === 0) return undefined;

            return data.data.map((x: any) => {
                let p: CustomerInfo = {
                    code: x.codigo,
                    documentNumber: x.numeroDocumento,
                    id: x.id,
                    name: x.nome,
                    phone: x.telefone,
                    profile: profile,
                    original: x
                };

                return p;
            })[0];
        })
        .catch(error => {
            console.error(error)
            return [];
        });

    return result;
}

export const getProducts = async (profile: string, key: string): Promise<ProductInfo[]> => {
    let result = await api.get(`/api/profile/${profile}/product?accountSecret=${key}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data.data) === false) {
                throw new Error("Failed to get data.");
            }

            return data.data.map((x: any) => {
                let p: ProductInfo = {
                    code: x.codigo,
                    description: x.nome,
                    id: x.id,
                    profile: profile,
                    stockQuantity: x.estoque?.saldoVirtualTotal,
                    value: x.preco,
                    original: x,
                };

                return p;
            });
        })
        .catch(error => {
            console.error(error)
            return [];
        });

    return result;
}

// Factory function to create OrderDataToExport instances
const createOrderFromJson = (jsonOrder: any, profile: string, key: string): OrderDataToExport => {

    if (!jsonOrder)
        throw new Error('Invalid object.')

    const order: OrderDataToExport = {
        status: OrderStatus.NotStartedYet,
        number: jsonOrder.numero,
        id: jsonOrder.id,
        profile: profile || 'Unknown',
        date: new Date(jsonOrder.data),
        productsToExport: [],
        products: [], // You can map products here if available in JSON
        errors: [],
        warnings: [],
        success: [],
        customer: {
            id: jsonOrder.contato?.id,
            name: jsonOrder.contato?.nome,
            document: jsonOrder.contato?.numeroDocumento,
            type: jsonOrder.contato?.tipoPessoa
        },
        totalPrice: jsonOrder.total || jsonOrder.totalProdutos,
        original: jsonOrder,

        resetStatus() {
            this.status = OrderStatus.NotStartedYet;
            this.errors = [];
            this.warnings = [];
            this.success = [];
        },

        // This method should check the follow scenarios
        // - When the product stock is less than the order -> So it can be exported
        // - If it was already uploaded, so the field 'data.transferInfo' will be not null
        // 
        async processStatus(products: ProductInfo[], productsToExport: ProductInfo[]): Promise<void> {
            try {
                await api.get(`/api/profile/${profile}/order/${this.id}?accountSecret=${key}`)
                    .then(response => response.data)
                    .then(data => {
                        if (data.transferInfo) {
                            this.status = OrderStatus.Exported;
                            return;
                        }

                        let itens = data.data.itens;
                        if (Array.isArray(itens) === false) {
                            this.status = OrderStatus.Error;
                            this.errors.push('Produtos não encontrados.')
                            return;
                        }

                        let productsFailedToMatch: any = [];
                        itens.forEach((item: any) => {
                            let productFound = products.find(x => x.id === item.produto?.id);

                            if (!productFound) {
                                // very hard to happen this case, 
                                // Bling ensures to have just orders with existent products
                                productsFailedToMatch.push(item);
                                this.errors.push(`Produto ${item.descricao} não encontrado no Bling raiz.`);
                                return;
                            }

                            console.debug(`Checking product ${productFound.code} - Stock quantity: ${productFound.stockQuantity} | Order product quantity: ${item.quantidade}`)
                            if (productFound.stockQuantity >= item.quantidade) {
                                this.status = OrderStatus.StockEnouth
                                return;
                            }

                            let productFoundToExport = productsToExport.find(x => x.id === item.produto?.id);

                            if (!productFoundToExport) {
                                productsFailedToMatch.push(item);
                                this.errors.push(`Produto ${productFound.description}(${productFound.code}) não encontrado no Bling para exportação.`);
                                return;
                            }
                            this.products.push(productFound)
                        });

                        if (productsFailedToMatch.length > 0) {
                            console.error('failed to match products.', productsFailedToMatch);
                            this.status = OrderStatus.Error;
                        }
                    })
                    .catch(error => {
                        console.error(`Failed to process order ${this.number}, Id: ${this.id}:`, error);
                        this.status = OrderStatus.Error
                    });
            } catch (error) {
                console.error(`Failed to process order ${this.number}, Id: ${this.id}:`, error);
                this.status = OrderStatus.Error
                this.errors.push(`Falha em processar pedido.`);
            }
        }
    };

    return order;
};

const createCustomer = async (customer: CustomerInfo, profile: string, key: string) => {
    let result = await api.post(
        `/api/profile/${profile}/customer/create?accountSecret=${key}`,
        ({
            nome: customer.original.nome || '',
            codigo: customer.original.codigo || undefined,
            situacao: "A",
            numeroDocumento: customer.documentNumber || undefined,
            telefone: customer.original.telefone || undefined,
            celular: customer.original.celular || undefined,
            fantasia: customer.original.fantasia || undefined,
            tipo: customer.original.tipo || '',
            indicadorIe: customer.original.indicadorIe || undefined,
            ie: customer.original.ie || undefined,
            rg: customer.original.rg || undefined,
            inscricaoMunicipal: customer.original.inscricaoMunicipal || undefined,
            orgaoEmissor: customer.original.orgaoEmissor || undefined,
            email: customer.original.email || undefined,
            emailNotaFiscal: customer.original.emailNotaFiscal || undefined,
            endereco: customer.original.endereco || undefined,
            vendedor: customer.original.vendedor || undefined,
            dadosAdicionais: customer.original.dadosAdicionais || undefined,
            financeiro: customer.original.financeiro || undefined,
            pais: customer.original.pais || undefined,
            tiposContato: customer.original.tiposContato || [],
            pessoasContato: customer.original.pessoasContato || []
        }))
        .then(response => response.data)
        .then(data => ({
            success: true,
            error: undefined,
            data: data,
        }))
        .catch(error => {
            console.error(error)
            return ({
                success: false,
                error: `Falha ao criar/coletar cliente '${customer.documentNumber}'.`,
                data: undefined,
            });
        });

    return result;
}

const createOrder = async (order: OrderDataToExport, customer: CustomerInfo) => {
    
}