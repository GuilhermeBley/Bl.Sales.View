
import { OrderDataToExport, OrderStatus } from '../model/OrderDataToExport';
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
        .then(data => data)
        .catch(error => {
            console.error(error)
            return [];
        });
    
    return result;
}

// Factory function to create OrderDataToExport instances
const createOrderFromJson = (jsonOrder: any): OrderDataToExport => {
  
  const order: OrderDataToExport = {
    status: OrderStatus.Loading,
    statusMessage: undefined,
    number: jsonOrder.numeroLoja || jsonOrder.numero?.toString(),
    id: jsonOrder.id.toString(),
    profile: jsonOrder.contato?.nome || 'Unknown',
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
    async processStatus(): Promise<void> {
      try {
        console.log(`Processing order ${this.number} with status: ${this.status}`);
        // Add your processing logic here
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`Order ${this.number} status processed successfully`);
      } catch (error) {
        console.error(`Failed to process order ${this.number}:`, error);
        throw error;
      }
    }
  };
  
  return order;
};