import api from "../../services/apiService"
import { SelectOption } from "../LazySelect"

export const getSituacoes = async (profile: string, key: string): Promise<SelectOption[]> => {
    let result = await api.get(`/api/profile/${profile}/order-status?accountSecret=${key}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data) === false) {
                throw new Error("Failed to get data.");
            }

            return data
                .filter(x => x)
                .map((x: any) => createOrderSituacao(x));
        })
        .catch(error => {
            console.error(error)
            return [];
        });

    return result;
}

export const getStores = async (profile: string, key: string): Promise<SelectOption[]> => {
    let result = await api.get(`/api/profile/${profile}/store?accountSecret=${key}`)
        .then(response => response.data)
        .then(data => {
            if (Array.isArray(data.data) === false) {
                throw new Error("Failed to get data.");
            }

            return data.data
                .filter((x: any) => x)
                .map((x: any) => createOrderStore(x));
        })
        .catch(error => {
            console.error(error)
            return [];
        });

    return result;
}

const createOrderSituacao = (x: any): SelectOption => {

    let select: SelectOption = {
        label: x.nome,
        value: x.id,
    };

    return select;
}

const createOrderStore = (x: any): SelectOption => {

    let select: SelectOption = {
        label: x.descricao,
        value: x.id,
    };

    return select;
}