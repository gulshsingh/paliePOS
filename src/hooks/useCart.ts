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
	const addOrder = useOrderStore((s) => s.addOrder);

	const onBillOrder = useCallback(
		(order: Order) => {
			const { orders } = useOrderStore.getState();
			const fullOrder = orders.find((o) => o.id === order.id);
			if (!fullOrder) {
				addOrder(order);
			}
			const src = fullOrder ?? order;
			clearCart();
			setCart(
				mergeOrderItems(src.items).map((i) => ({
					...i,
					sentToKitchen: true,
				})),
			);
			setActiveOrder(order.id);
		},
		[addOrder, clearCart, setCart, setActiveOrder],
	);

	return {
		cart,
		clearCart,
		onBillOrder,
		activeOrderId,
	};
}
