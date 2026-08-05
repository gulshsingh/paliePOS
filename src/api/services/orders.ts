import type {
	ApiResponse,
	CreateOrderPayload,
	UpdateItemStatusPayload,
} from "../../types/api";
import type { ApiOrder } from "../../types/order";
import { api } from "../client";

export const getOrders = (params?: {
	item_status?: string;
	status?: string;
	cursor?: string | null;
	limit?: number;
}) =>
	api.get<ApiResponse<{ data: ApiOrder[]; pagination: any }>>("/orders", {
		params: { ...params, limit: params?.limit ?? 20 },
	});

export const getOrder = (id: string) =>
	api.get<ApiResponse<ApiOrder>>(`/orders/${id}`);

export const createOrder = (data: CreateOrderPayload) =>
	api.post<ApiResponse<ApiOrder>>("/orders", data);

export const updateItemStatus = ({
	item_id,
	status,
}: UpdateItemStatusPayload) =>
	api.patch<ApiResponse<void>>(`/orders/items/${item_id}/`, { status });

export const updateOrderStatus = (orderId: string, status: string) =>
	api.put<ApiResponse<void>>(`/orders/${orderId}/status`, { status });
