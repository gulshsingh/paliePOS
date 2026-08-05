export interface ApiResponse<T> {
	data: T;
	message?: string;
	success: boolean;
	pagination?: {
		next_cursor: string | null;
		has_more: boolean;
		total?: number;
	};
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		next_cursor: string | null;
		has_more: boolean;
		total?: number;
	};
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
		company_id: string;
	};
}

export interface CreateOrderPayload {
	table_id?: string | null;
	account_id?: string | null;
	total_amount: number;
	tax_amount: number;
	discount_amount: number;
	grand_total: number;
	items: {
		product_id: string;
		quantity: number;
		price: number;
		total: number;
	}[];
}

export interface UpdateItemStatusPayload {
	item_id: string;
	status: string;
}

export interface CreatePaymentPayload {
	invoice_id: string;
	paid_amount: number;
	change_amount: number;
	payment_method: string;
}

export interface DashboardData {
	total_orders_today: number;
	total_revenue_today: number;
	total_customers: number;
	total_products: number;
	orders_by_status: { status: string; count: number }[];
	recent_orders: any[];
}
