import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	addOrderItems,
	createOrder,
	getOrders,
	updateItemStatus,
	updateOrderStatus,
} from "../api/services/orders";
import type { CreateOrderPayload } from "../types/api";

export function useOrders(itemStatus?: string) {
	return useInfiniteQuery({
		queryKey: ["orders", itemStatus],
		initialPageParam: null as string | null,
		queryFn: ({ pageParam }) =>
			getOrders({ item_status: itemStatus, cursor: pageParam }),
		getNextPageParam: (lastPage) => {
			// The API wraps responses in ApiResponse<{ data: T[], pagination: {} }>
			// so the actual pagination object can be nested 1-2 levels deep.
			const d = lastPage.data as any;
			const pagination =
				d?.data?.pagination ?? d?.data?.data?.pagination ?? d?.pagination;
			return pagination?.next_cursor ?? undefined;
		},
		staleTime: 5 * 1000,
		refetchInterval: 5 * 1000,
	});
}

export function useCreateOrder() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateOrderPayload) => createOrder(data),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}

export function useAddOrderItems() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			orderId,
			items,
		}: {
			orderId: string;
			items: CreateOrderPayload["items"];
		}) => addOrderItems(orderId, items),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}

export function useUpdateItemStatus() {
	return useMutation({
		mutationFn: (data: { item_id: string; status: string }) =>
			updateItemStatus(data),
		onError: (e, data) => {
			console.warn(
				`[status] item ${data.item_id} -> ${data.status} failed:`,
				(e as any)?.response?.status,
				(e as any)?.response?.data,
				e,
			);
		},
		// No optimistic cache write and no invalidate-on-success here. The
		// OrdersPanel drives the UI instantly via zustand itemStatusOverrides
		// (set in updateItemStatusLocally), and the 5s orders poll reconciles
		// with the server in the background. Writing the status into the cache
		// here would make OrdersPanel's confirmation effect treat a local write
		// as server-confirmed and clear the override too early, causing the
		// order to flicker back to its source tab until the next poll.
	});
}

export function useUpdateOrderStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
			updateOrderStatus(orderId, status),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
	});
}
