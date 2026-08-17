import { useCallback } from "react";
import { useOrderStore } from "../store/orderStore";
import type { ApiOrderItemStatus } from "../types/order";
import {
	useUpdateItemStatus,
	useUpdateOrderStatus as useUpdateOrderStatusMutation,
} from "./useOrders";

export function useUpdateOrderStatus() {
	const updateRemote = useUpdateOrderStatusMutation();
	const updateItemRemote = useUpdateItemStatus();

	const updateItemStatusLocally = useCallback(
		(itemId: string, status: ApiOrderItemStatus) => {
			const { orders, updateItemStatus } = useOrderStore.getState();
			const order = orders.find((o) => o.items.some((i) => i.id === itemId));
			// Sync local zustand copy if the order is known (created in this session)
			if (order) {
				updateItemStatus(order.id, itemId, status);
			}
			// Always push to the server — server-loaded orders are not in zustand
			updateItemRemote.mutate({ item_id: itemId, status });
		},
		[updateItemRemote],
	);

	const updateOrderStatus = useCallback(
		(orderId: string, status: string) =>
			updateRemote.mutate({ orderId, status }),
		[updateRemote],
	);

	return {
		updateItemStatusLocally,
		updateOrderStatus,
		isPending: updateRemote.isPending || updateItemRemote.isPending,
	};
}
