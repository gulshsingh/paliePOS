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
import { extractNextCursor } from "../utils/apiHelpers";

export function useOrders(itemStatus?: string) {
	return useInfiniteQuery({
		queryKey: ["orders", itemStatus],
		initialPageParam: null as string | null,
		queryFn: ({ pageParam }) =>
			getOrders({ item_status: itemStatus, cursor: pageParam }),
		getNextPageParam: (lastPage) => extractNextCursor(lastPage.data),
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
	const qc = useQueryClient();
	return useMutation({
		mutationFn: updateItemStatus,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}

export function useUpdateOrderStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
			updateOrderStatus(orderId, status),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["orders"] });
		},
	});
}
