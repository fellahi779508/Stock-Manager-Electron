import api from "@/utils/api";

export async function getAllBatches(page: number, search?: string) {
	try {
		const response = await api
			.get(`/batch?page=${page}&limit=10${search ? `&search=${search}` : ""}`)
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function getBatchById(id: number) {
	try {
		const response = await api.get(`/batch/${id}`).then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function verifyExpiry() {
	try {
		const response = await api
			.post(`/batch/verify-expiry`)
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function getExpiredBatches(page: number, limit: number) {
	try {
		const response = await api
			.get(`/batch/expired?page=${page}&limit=${limit}`)
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function getExpiringBatches(page: number, limit: number) {
	try {
		const response = await api
			.get(`/batch/expiring?page=${page}&limit=${limit}`)
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function updateBatchById(id: number, data: any) {
	try {
		const response = await api
			.put(`/batch/${id}`, data)
			.then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function getLowStockBatches() {
	try {
		const response = await api.get(`/batch/low`).then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function getOutOfStockBatches() {
	try {
		const response = await api.get(`/batch/empty`).then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
export async function getNormalBatches() {
	try {
		const response = await api.get(`/batch/normal`).then((res) => res.data);
		console.log(response);
		return { response, status: 1 };
	} catch (error: any) {
		return { error: error.response.data.message, status: 0 };
	}
}
