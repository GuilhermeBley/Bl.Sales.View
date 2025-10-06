interface PostOrderModel {

}

const fakeOrderData = [
  { number: 1, date: "2025-01-01", products: [{ code: 1, name: "Produto 1" }], customer: { code: 1, name: "Rubens Maria" }, totalPrice: 200.00 },
  { number: 2, date: "2025-01-02", products: [{ code: 2, name: "Produto 2" }, { code: 3, name: "Produto 3" }], customer: { code: 2, name: "Ana Silva" }, totalPrice: 350.50 },
  { number: 3, date: "2025-01-03", products: [{ code: 4, name: "Produto 4" }], customer: { code: 3, name: "Carlos Santos" }, totalPrice: 120.00 },
  { number: 4, date: "2025-01-04", products: [{ code: 1, name: "Produto 1" }, { code: 5, name: "Produto 5" }], customer: { code: 4, name: "Mariana Costa" }, totalPrice: 450.75 },
  { number: 5, date: "2025-01-05", products: [{ code: 6, name: "Produto 6" }], customer: { code: 5, name: "João Pereira" }, totalPrice: 89.90 },
  { number: 6, date: "2025-01-06", products: [{ code: 7, name: "Produto 7" }, { code: 8, name: "Produto 8" }, { code: 9, name: "Produto 9" }], customer: { code: 6, name: "Fernanda Lima" }, totalPrice: 620.30 },
  { number: 7, date: "2025-01-07", products: [{ code: 10, name: "Produto 10" }], customer: { code: 7, name: "Ricardo Alves" }, totalPrice: 150.00 },
  { number: 8, date: "2025-01-08", products: [{ code: 2, name: "Produto 2" }, { code: 4, name: "Produto 4" }], customer: { code: 8, name: "Patrícia Rocha" }, totalPrice: 275.25 },
  { number: 9, date: "2025-01-09", products: [{ code: 11, name: "Produto 11" }], customer: { code: 9, name: "Bruno Oliveira" }, totalPrice: 199.99 },
  { number: 10, date: "2025-01-10", products: [{ code: 12, name: "Produto 12" }, { code: 13, name: "Produto 13" }], customer: { code: 10, name: "Juliana Martins" }, totalPrice: 410.60 },
  { number: 11, date: "2025-01-11", products: [{ code: 3, name: "Produto 3" }], customer: { code: 1, name: "Rubens Maria" }, totalPrice: 180.00 },
  { number: 12, date: "2025-01-12", products: [{ code: 14, name: "Produto 14" }, { code: 15, name: "Produto 15" }], customer: { code: 2, name: "Ana Silva" }, totalPrice: 530.40 },
  { number: 13, date: "2025-01-13", products: [{ code: 5, name: "Produto 5" }, { code: 6, name: "Produto 6" }, { code: 7, name: "Produto 7" }], customer: { code: 11, name: "Lucas Ferreira" }, totalPrice: 720.80 },
  { number: 14, date: "2025-01-14", products: [{ code: 8, name: "Produto 8" }], customer: { code: 12, name: "Amanda Souza" }, totalPrice: 95.50 },
  { number: 15, date: "2025-01-15", products: [{ code: 16, name: "Produto 16" }, { code: 17, name: "Produto 17" }], customer: { code: 3, name: "Carlos Santos" }, totalPrice: 380.25 },
  { number: 16, date: "2025-01-16", products: [{ code: 9, name: "Produto 9" }, { code: 10, name: "Produto 10" }], customer: { code: 13, name: "Roberto Nunes" }, totalPrice: 290.00 },
  { number: 17, date: "2025-01-17", products: [{ code: 18, name: "Produto 18" }], customer: { code: 4, name: "Mariana Costa" }, totalPrice: 210.75 },
  { number: 18, date: "2025-01-18", products: [{ code: 19, name: "Produto 19" }, { code: 20, name: "Produto 20" }], customer: { code: 14, name: "Tatiane Ramos" }, totalPrice: 495.90 },
  { number: 19, date: "2025-01-19", products: [{ code: 1, name: "Produto 1" }, { code: 11, name: "Produto 11" }], customer: { code: 5, name: "João Pereira" }, totalPrice: 325.60 },
  { number: 20, date: "2025-01-20", products: [{ code: 12, name: "Produto 12" }], customer: { code: 15, name: "Diego Costa" }, totalPrice: 145.00 },
  { number: 21, date: "2025-01-21", products: [{ code: 13, name: "Produto 13" }, { code: 14, name: "Produto 14" }, { code: 15, name: "Produto 15" }], customer: { code: 6, name: "Fernanda Lima" }, totalPrice: 680.45 }
];

export const postTargetOrder = async (order : PostOrderModel) => {
    await new Promise(resolve => setTimeout(resolve, 1_000)); // fake loading

    console.log('Processing order.')
    return {
        orderCode: crypto.randomUUID()
    }
}

export const getSourceOrders = async () => {
    await new Promise(resolve => setTimeout(resolve, 2_000)); // fake loading
    
    return fakeOrderData;
}