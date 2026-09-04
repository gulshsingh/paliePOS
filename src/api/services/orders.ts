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
}) => {
	const clean: Record<string, any> = { limit: params?.limit ?? 20 };
	if (params?.item_status) clean.item_status = params.item_status;
	if (params?.status) clean.status = params.status;
	if (params?.cursor) clean.cursor = params.cursor;
	return api.get<ApiResponse<{ data: ApiOrder[]; pagination: any }>>("/orders", {
		params: clean,
	});
};

export const getOrder = (id: string) =>
	api.get<ApiResponse<ApiOrder>>(`/orders/${id}`);

export const createOrder = (data: CreateOrderPayload) =>
	api.post<ApiResponse<ApiOrder>>("/orders", data);

export const addOrderItems = (
	orderId: string,
	payload: {
		items: { product_id: string; quantity: number; price: number }[];
		tax_amount?: number;
		discount_amount?: number;
	},
) => api.post<ApiResponse<ApiOrder>>(`/orders/${orderId}/items/`, payload);

export const updateItemStatus = ({
	item_id,
	status,
}: UpdateItemStatusPayload) =>
	api.patch<ApiResponse<void>>(`/orders/items/${item_id}/`, { status });

export const updateOrderStatus = (orderId: string, status: string) =>
	api.put<ApiResponse<void>>(`/orders/${orderId}/status`, { status });
