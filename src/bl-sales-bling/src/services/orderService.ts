
import { OrderDataToExport, OrderStatus, ProductInfo, CustomerInfo } from '../model/OrderDataToExport';
import api from './apiService'

interface PostOrderModel {

}

export const postTargetOrder = async (order : PostOrderModel) => {
    await new Promise(resolve => setTimeout(resolve, 1_000)); // fake loading

    console.log('Processing order.')
    return {
        orderCode: crypto.randomUUID()
    }
}

export const getSourceOrders = async (profile: string, key: string) : Promise<OrderDataToExport[]> => {
    let result = await api.get(`/api/profile/${profile}/order?accountSecret=${key}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data.data) === false)
            {
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

export const getCustomer = async (profile: string, key: string, documentNumber: string) : Promise<CustomerInfo | undefined> => {
    let result = await api.get(`/api/profile/${profile}/product?accountSecret=${key}&documentNumber=${documentNumber}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data.data) === false)
            {
                throw new Error("Failed to get data.");
            }

            if (data.data.length === 0) return undefined;

            return data.data.map((x: any) => {
                let p : CustomerInfo = {
                    code: x.codigo,
                    documentNumber: x.numeroDocumento,
                    id: x.id,
                    name: x.nome,
                    phone: x.telefone,
                    profile: profile
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

export const getProducts = async (profile: string, key: string) : Promise<ProductInfo[]> => {
    let result = await api.get(`/api/profile/${profile}/customers?accountSecret=${key}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data.data) === false)
            {
                throw new Error("Failed to get data.");
            }

            return data.data.map((x: any) => {
                let p : ProductInfo = {
                    code: x.codigo,
                    description: x.descricaoCurta,
                    id: x.id,
                    profile: profile,
                    stockQuantity: x.estoque?.saldoVirtualTotal,
                    value: x.preco
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
const createOrderFromJson = (jsonOrder: any, profile :string, key: string): OrderDataToExport => {
  
    if (!jsonOrder)
        throw new Error('Invalid object.')

  const order: OrderDataToExport = {
    status: OrderStatus.Loading,
    statusMessage: undefined,
    number: jsonOrder.numero,
    id: jsonOrder.id,
    profile: profile || 'Unknown',
    date: new Date(jsonOrder.data),
    products: [], // You can map products here if available in JSON
    customer: {
      id: jsonOrder.contato?.id,
      name: jsonOrder.contato?.nome,
      document: jsonOrder.contato?.numeroDocumento,
      type: jsonOrder.contato?.tipoPessoa
    },
    totalPrice: jsonOrder.total || jsonOrder.totalProdutos,
    // Implement the method directly
    async processStatus(products: ProductInfo[]): Promise<void> {
      try {
        await api.get(`/api/profile/${profile}/order/${this.id}?accountSecret=${key}`)
            .then(response => response.data)
            .then(data => {
                if (data.transferInfo)
                {
                    this.status = OrderStatus.Exported;
                    this.statusMessage = 'Pedido já exportado.'
                }

                if (Array.isArray(data.itens) === false)
                {
                    this.status = OrderStatus.Error;
                    this.statusMessage = 'Produtos não encontrados.'
                    return;
                }
                
                let productsFailedToMatch :any = [];
                data.itens.forEach((item: any) => {
                    let productFound = products.find(x => x.id === item.produto?.id);

                    if (!productFound)
                    {
                        productsFailedToMatch.push(item);
                        return;
                    }

                    this.products.push(productFound)
                });

                if (productsFailedToMatch.length > 0)
                {
                    console.error('failed to match products.', productsFailedToMatch);
                    this.status = OrderStatus.Error;
                    this.statusMessage = 'Produtos não encontrados.'
                }
            })
            .catch(error => {
                console.error(`Failed to process order ${this.number}:`, error);
                this.status = OrderStatus.Error
                this.statusMessage = 'Falha ao coletar dados de pedido.'
            });
      } catch (error) {
        console.error(`Failed to process order ${this.number}:`, error);
        this.status = OrderStatus.Error
        this.statusMessage = 'Falha ao coletar dados de pedido.'
      }
    }
  };
  
  return order;
};