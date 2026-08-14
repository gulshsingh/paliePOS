export type CartItemStatus =
	| "pending"
	| "preparing"
	| "ready"
	| "served"
	| "cancelled";

export interface CartItem {
	id: string;
	name: string;
	price: number;
	price_per_unit: number;
	qty: number;
	tax: number;
	status: CartItemStatus;
	product_id?: string;
	sentToKitchen?: boolean;
	kotNo?: number;
}

export interface CartTotals {
	subtotal: number;
	taxTotal: number;
	grandTotal: number;
}
