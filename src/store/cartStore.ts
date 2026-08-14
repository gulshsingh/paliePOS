import { create } from "zustand";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/product";

interface CartStore {
	cart: CartItem[];
	setCart: (items: CartItem[]) => void;
	addToCart: (product: Product) => void;
	updateItem: (id: string, data: Partial<CartItem>) => void;
	increaseQty: (id: string) => void;
	decreaseQty: (id: string) => void;
	removeItem: (id: string) => void;
	clearCart: () => void;
	getTotals: () => { subtotal: number; taxTotal: number; grandTotal: number };
}

export const useCartStore = create<CartStore>((set, get) => ({
	cart: [],
	setCart: (items) => set({ cart: items }),
	addToCart: (product) =>
		set((state) => {
			// Merge only into lines not yet confirmed to kitchen, so a locked
			// (sentToKitchen) line stays untouched while editing an order.
			const existing = state.cart.find(
				(i) =>
					!i.sentToKitchen &&
					((i.product_id && i.product_id === product.id) ||
						i.id === product.id),
			);
			if (existing) {
				return {
					cart: state.cart.map((i) =>
						i.id === existing.id
							? { ...i, qty: i.qty + 1, price: i.price_per_unit * (i.qty + 1) }
							: i,
					),
				};
			}
			return {
				cart: [
					...state.cart,
					{
						id: product.id,
						name: product.name,
						price_per_unit: Number(product.price_per_unit),
						price: Number(product.price_per_unit),
						qty: 1,
						tax: Number(product.tax_percentage),
						status: "pending",
						product_id: product.id,
						sentToKitchen: false,
					},
				],
			};
		}),
	updateItem: (id, data) =>
		set((state) => ({
			cart: state.cart.map((i) => (i.id === id ? { ...i, ...data } : i)),
		})),
	increaseQty: (id) =>
		set((state) => ({
			cart: state.cart.map((i) =>
				i.id === id
					? { ...i, qty: i.qty + 1, price: i.price_per_unit * (i.qty + 1) }
					: i,
			),
		})),
	decreaseQty: (id) =>
		set((state) => ({
			cart: state.cart
				.map((i) =>
					i.id === id
						? { ...i, qty: i.qty - 1, price: i.price_per_unit * (i.qty - 1) }
						: i,
				)
				.filter((i) => i.qty > 0),
		})),
	removeItem: (id) =>
		set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
	clearCart: () => set({ cart: [] }),
	getTotals: () => {
		const { cart } = get();
		const subtotal = cart.reduce((s, i) => s + i.price_per_unit * i.qty, 0);
		const taxTotal = cart.reduce(
			(s, i) => s + (i.price_per_unit * i.qty * i.tax) / 100,
			0,
		);
		return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
	},
}));
