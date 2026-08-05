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

export interface StockSummary {
	total_products: number;
	total_stock_value: number;
	total_cost_value: number;
	low_stock_count: number;
	out_of_stock_count: number;
}

export interface LowStockItem {
	id: string;
	product_id: string;
	product_name: string;
	quantity: number;
	min_stock_level: number;
	unit: string;
}
