import { create } from "zustand";
import type { ApiOrderItemStatus, Order } from "../types/order";

interface OrderStore {
	orders: Order[];
	activeOrderId: string | null;
	// Locally-confirmed item status changes (itemId -> status). Set instantly
	// on tap so the UI moves the order between tabs with ZERO delay; cleared
	// once the server confirms via the next orders fetch.
	itemStatusOverrides: Record<string, ApiOrderItemStatus>;
	setOrders: (orders: Order[]) => void;
	addOrder: (order: Order) => void;
	updateOrder: (id: string, data: Partial<Order>) => void;
	updateItemStatus: (
		orderId: string,
		itemId: string,
		status: ApiOrderItemStatus,
	) => void;
	setItemStatusOverride: (
		itemId: string,
		status: ApiOrderItemStatus,
	) => void;
	clearItemStatusOverride: (itemId: string) => void;
	setActiveOrder: (id: string | null) => void;
	deleteOrder: (id: string) => void;
}

// Maximum number of orders to keep in memory. Orders are prepended newest-
// first, so trimming the tail drops the oldest session orders. The active
// order and any order with a pending item-status override are never evicted.
const MAX_ORDERS = 100;

export const useOrderStore = create<OrderStore>((set) => ({
	orders: [],
	activeOrderId: null,
	itemStatusOverrides: {},
	setOrders: (orders) => set({ orders }),
	addOrder: (order) =>
		set((state) => {
			const next = [order, ...state.orders];
			// Trim oldest orders beyond the cap, but never evict the active order
			// or orders that still have in-flight status overrides.
			if (next.length > MAX_ORDERS) {
				const overrideIds = new Set(
					next.flatMap((o) =>
						o.items
							.filter((i) => i.id in state.itemStatusOverrides)
							.map((i) => i.id),
					),
				);
				let trimmed = 0;
				const capped = next.filter((o) => {
					if (trimmed >= next.length - MAX_ORDERS) return true;
					if (o.id === state.activeOrderId) return true;
					if (o.items.some((i) => overrideIds.has(i.id))) return true;
					trimmed++;
					return false;
				});
				return { orders: capped };
			}
			return { orders: next };
		}),
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
	setItemStatusOverride: (itemId, status) =>
		set((state) => ({
			itemStatusOverrides: {
				...state.itemStatusOverrides,
				[itemId]: status,
			},
		})),
	clearItemStatusOverride: (itemId) =>
		set((state) => {
			const next = { ...state.itemStatusOverrides };
			delete next[itemId];
			return { itemStatusOverrides: next };
		}),
	setActiveOrder: (id) => set({ activeOrderId: id }),
	deleteOrder: (id) =>
		set((state) => ({
			orders: state.orders.filter((o) => o.id !== id),
			activeOrderId: state.activeOrderId === id ? null : state.activeOrderId,
		})),
}));
