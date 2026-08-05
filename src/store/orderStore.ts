import { create } from "zustand";
import type { ApiOrderItemStatus, Order } from "../types/order";

interface OrderStore {
	orders: Order[];
	activeOrderId: string | null;
	setOrders: (orders: Order[]) => void;
	addOrder: (order: Order) => void;
	updateOrder: (id: string, data: Partial<Order>) => void;
	updateItemStatus: (
		orderId: string,
		itemId: string,
		status: ApiOrderItemStatus,
	) => void;
	setActiveOrder: (id: string | null) => void;
	deleteOrder: (id: string) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
	orders: [],
	activeOrderId: null,
	setOrders: (orders) => set({ orders }),
	addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
	updateOrder: (id, data) =>
		set((state) => ({
			orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
		})),
	updateItemStatus: (orderId, itemId, status) =>
		set((state) => ({
			orders: state.orders.map((o) =>
				o.id === orderId
					? {
							...o,
							items: o.items.map((i) =>
								i.id === itemId ? { ...i, status } : i,
							),
						}
					: o,
			),
		})),
	setActiveOrder: (id) => set({ activeOrderId: id }),
	deleteOrder: (id) =>
		set((state) => ({
			orders: state.orders.filter((o) => o.id !== id),
			activeOrderId: state.activeOrderId === id ? null : state.activeOrderId,
		})),
}));
