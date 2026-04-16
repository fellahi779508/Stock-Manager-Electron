import api from "@/utils/api";

export async function getAllStocks(page: number, search?: string) {
	try {
		const response = await api
			.get(`/stock?page=${page}&limit=10${search ? `&search=${search}` : ""}`)
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function addToStock(id: number, quantity: number, reason: string) {
	try {
		const response = await api
			.put(`/stock/add/${id}`, { quantity, reason })
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function removeFromStock(
	id: number,
	quantity: number,
	reason: string,
) {
	try {
		const response = await api
			.put(`/stock/remove/${id}`, { quantity, reason })
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
