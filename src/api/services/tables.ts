import type { ApiResponse, PaginatedResponse } from "../../types/api";
import type { RestaurantTable } from "../../types/table";
import { api } from "../client";

export const getTables = (params?: {
	cursor?: string | null;
	limit?: number;
}) =>
	api.get<ApiResponse<PaginatedResponse<RestaurantTable>>>("/tables", {
		params: {
			limit: params?.limit ?? 50,
			...(params?.cursor ? { cursor: params.cursor } : {}),
		},
	});

export const getTable = (id: string) =>
	api.get<ApiResponse<RestaurantTable>>(`/tables/${id}`);

export const createTable = (data: Partial<RestaurantTable>) =>
	api.post<ApiResponse<RestaurantTable>>("/tables", data);

export const updateTable = (id: string, data: Partial<RestaurantTable>) =>
	api.put<ApiResponse<RestaurantTable>>(`/tables/${id}`, data);

export const deleteTable = (id: string) =>
	api.delete<ApiResponse<void>>(`/tables/${id}`);
