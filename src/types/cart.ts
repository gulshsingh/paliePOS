export interface CartItem {
	id: string;
	name: string;
	price: number;
	price_per_unit: number;
	qty: number;
	tax: number;
	status: "pending" | "preparing" | "ready" | "served" | "cancelled";
}

export interface CartTotals {
	subtotal: number;
	taxTotal: number;
	grandTotal: number;
}
