import api from "@/utils/api";
import { PostSale } from "@/utils/types";
import { log } from "console";

export async function getAllSales(
	page: number,
	limit: number,
	search?: string,
) {
	try {
		const response = await api
			.get(`/sales?page=${page}&limit=${limit}&search=${search}`)
			.then((res) => res.data);
		return { response, status: 1 };
	} catch (error: any) {
		console.log(error.response);
		return { error, status: 0 };
	}
}
export async function createSale(data: PostSale) {
	try {
		const response = await api.post(`/sale`, data).then((res) => res.data);
		return { response, status: 1 };
	} catch (error: any) {
		console.log(error.response);
		return { error, status: 0 };
	}
}
