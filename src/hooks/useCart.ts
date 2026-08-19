import { useCallback } from "react";
import { mergeOrderItems, useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import type { Order } from "../types/order";

export function useCart() {
	const cart = useCartStore((s) => s.cart);
	const setCart = useCartStore((s) => s.setCart);
	const clearCart = useCartStore((s) => s.clearCart);
	const activeOrderId = useOrderStore((s) => s.activeOrderId);
	const setActiveOrder = useOrderStore((s) => s.setActiveOrder);
	const orders = useOrderStore((s) => s.orders);
	const addOrder = useOrderStore((s) => s.addOrder);

	const onBillOrder = useCallback(
		(order: Order) => {
			const fullOrder = orders.find((o) => o.id === order.id);
			if (!fullOrder) {
				addOrder(order);
			}
			const src = fullOrder ?? order;
			clearCart();
			// Merge duplicate product lines across KOTs so the bill shows one
			// combined line per item (e.g. Roti 5 + Roti 5 -> Roti 10).
			setCart(
				mergeOrderItems(src.items).map((i) => ({
					...i,
					sentToKitchen: true,
				})),
			);
			setActiveOrder(order.id);
		},
		[orders, addOrder, clearCart, setCart, setActiveOrder],
	);

	return {
		cart,
		clearCart,
		onBillOrder,
		activeOrderId,
	};
}
