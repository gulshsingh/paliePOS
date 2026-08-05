import type { CartItem } from "./cart";

export type OrderStatus =
	| "PENDING"
	| "PREPARING"
	| "READY"
	| "SERVED"
	| "COMPLETED"
	| "CANCELLED";
export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";
export type ApiOrderItemStatus =
	| "pending"
	| "preparing"
	| "ready"
	| "served"
	| "cancelled";

export interface Order {
	id: string;
	order_number: string;
	items: CartItem[];
	total: number;
	status: OrderStatus;
	paymentStatus: PaymentStatus;
	table_id?: string | null;
	account_id?: string | null;
	table_name?: string;
	customer_name?: string;
	invoice?: boolean;
	invoice_number?: string;
	amountPaid?: number;
	balance?: number;
	created_at?: string;
	updated_at?: string;
}

export interface ApiOrderItem {
	id: string;
	product_id: string;
	product_name?: string;
	quantity: number;
	price: number;
	total: number;
	status: ApiOrderItemStatus;
	product?: {
		id: string;
		name: string;
		price: number;
		price_per_unit: number;
		tax_percentage: number;
	};
}

export interface ApiOrder {
	id: string;
	order_number: string;
	items: ApiOrderItem[];
	total_amount: number;
	tax_amount: number;
	discount_amount: number;
	grand_total: number;
	status: OrderStatus;
	payment_status: PaymentStatus;
	table_id?: string | null;
	account_id?: string | null;
	table?: { id: string; name: string };
	account?: { id: string; name: string };
	created_at?: string;
	updated_at?: string;
}
