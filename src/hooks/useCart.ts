import { useCartStore } from "../store/cartStore";
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

	const onBillOrder = (order: Order) => {
		const fullOrder = orders.find((o) => o.id === order.id);
		if (!fullOrder) {
			addOrder(order);
		}
		const src = fullOrder ?? order;
		clearCart();
		setCart(
			src.items.map((i) => ({
				...i,
				sentToKitchen: true,
			})),
		);
		setActiveOrder(order.id);
	};

	return {
		cart,
		clearCart,
		onBillOrder,
		activeOrderId,
	};
}
