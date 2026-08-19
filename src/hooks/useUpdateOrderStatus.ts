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
			const { orders, updateItemStatus, setItemStatusOverride } =
				useOrderStore.getState();
			// Optimistic: set the override FIRST so the UI moves the order to
			// the next tab instantly, independent of any fetch/refetch timing.
			setItemStatusOverride(itemId, status);

			// Sync local zustand copy if the order is known (created in this session).
			// Also remember the previous status so we can roll it back on error.
			const order = orders.find((o) => o.items.some((i) => i.id === itemId));
			const prevStatus = order?.items.find((i) => i.id === itemId)?.status;
			if (order) {
				updateItemStatus(order.id, itemId, status);
			}

			// Always push to the server — server-loaded orders are not in zustand
			updateItemRemote.mutate(
				{ item_id: itemId, status },
				{
					onError: () => {
						// Roll back the override AND the zustand orders array so both
						// stay consistent with the server-confirmed state.
						useOrderStore.getState().clearItemStatusOverride(itemId);
						if (order && prevStatus) {
							useOrderStore
								.getState()
								.updateItemStatus(order.id, itemId, prevStatus);
						}
					},
				},
			);
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
