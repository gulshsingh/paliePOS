import type { PaginationMeta } from "./api";

export interface InventoryResponseWrapper<T> {
	pagination?: PaginationMeta | null;
	data: T;
	error?: string | null;
}

export interface InventoryDashboardData {
	total_products: number;
	raw_materials: number;
	finished_products: number;
	total_stock_quantity: number;
	inventory_value: number;
	low_stock: number;
	out_of_stock: number;
	today_purchase: number;
	today_production: number;
	today_sale: number;
	expiring_products: number;
	total_orders_today?: number;
	total_revenue_today?: number;
	total_customers?: number;
}

export interface StockSummary {
	total_products?: number;
	total_stock_value?: number;
	total_cost_value?: number;
	low_stock_count?: number;
	out_of_stock_count?: number;
}

export interface LowStockItem {
	id: string;
	product_id: string;
	product_name: string;
	quantity: number;
	min_stock_level: number;
	unit: string;
}

export interface InventoryItem {
	id: string;
	product_id: string;
	product_name: string;
	quantity: number;
	unit: string;
	min_stock_level: number;
	cost_per_unit: number;
	created_at?: string;
	updated_at?: string;
}
