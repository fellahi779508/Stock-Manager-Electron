import { exportTraceState } from "next/dist/trace";

export type Product = {
	name: string;
	category: Category;
	id: number;
	createdAt: string;
	updatedAt: string;
};
export type PostProduct = {
	name: string;
	categoryId?: number;
	createdAt: string;
	updatedAt: string;
};
export type Category = {
	name: string;
	id: number;
};
export type PostCategory = {
	name: string;
};
export type Meta = {
	total: number;
	page: number;
	limit: number;
	pages: number;
};
export type PostVarinat = {
	name: string;
	barcode: string;
	size?: string;
	color?: string;
	weight?: string;
	height?: string;
	flavor?: string;
	productId: number;
	fabricationDate?: string | null;
	expirationDate?: string | null;
	supplierId?: number;
	quantity: number;
	alertPeriodPerDay?: number;
	alertPeriodPerStock?: number;
	purchasePrice: number;
	sellingPriceHT: number;
	profit: number;
	profitRate: number;
	sellingPriceTTC: number;
	promotionPrice?: number;
	promotionRate?: number;
	vatRate: number;
	PPA?: number;
	nLot?: string;
};
export type DetailedProduct = {
	name: string;
	category: Category;
	id: number;
	variants: Variant[];
	createdAt: string;
	updatedAt: string;
};
export type Variant = {
	id: number;
	name: string;
	barcode: string;
	size?: string;
	color?: string;
	weight?: number;
	height?: number;
	flavor?: string;
	batches: Batch[];
	createdAt: string;
	updatedAt: string;
};
export type Batch = {
	fabricationDate?: string;
	expirationDate?: string;
	supplier: Supplier | null;
	alertPeriodPerDay?: number;
	purchasePrice: number;
	sellingPriceHT: number;
	sellingPriceTTC: number;

	vatRate: number;
	stock: Stock;
	createdAt: string;
	updatedAt: string;
	id: number;
};
export type Stock = {
	createdAt: string;
	updatedAt: string;
	id: number;
	quantity: number;
};
export type Supplier = {
	createdAt: string;
	updatedAt: string;
	id: number;
	name: string;
	address: string;
	phone: string;
	email: string;
};
export type PostSupplier = {
	name: string;
	address?: string | null;
	phone?: string | null;
	email?: string | null;
};
