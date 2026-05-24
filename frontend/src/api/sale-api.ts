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
	console.log(data);

	try {
		const response = await api.post(`/sale`, data).then((res) => res.data);
		return { response, status: 1 };
	} catch (error: any) {
		return { error, status: 0 };
	}
}
export async function getTodaysSales() {
	try {
		const response = await api.get(`/sale/todays`).then((res) => res.data);
		console.log(response);

		return { response, status: 1 };
	} catch (error: any) {
		return { error, status: 0 };
	}
}
export default async function updateSaleByid(id: number, Sale: PostSale) {
	try {
		const response = await api.put(`/sale/${id}`, Sale).then((res) => res.data);
		return { response, status: 1 };
	} catch (error: any) {
		return { error, status: 0 };
	}
}
