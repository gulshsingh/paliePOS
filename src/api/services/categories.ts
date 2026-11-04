import type { ApiResponse, PaginatedResponse } from "../../types/api";
import type { Category } from "../../types/category";
import { api } from "../client";

export const getCategories = (cursor?: string | null, limit = 50) =>
	api.get<ApiResponse<PaginatedResponse<Category>>>("/product/categories/", {
		params: {
			limit,
			...(cursor ? { cursor } : {}),
		},
	});

export const createCategory = (data: { name: string; type?: string }) =>
	api.post<ApiResponse<Category>>("/product/categories/", {
		...data,
		type: "product",
	});

export const updateCategory = (id: string, data: { name: string }) =>
	api.put<ApiResponse<Category>>(`/product/categories/${id}/`, {
		...data,
		type: "product",
	});

export const deleteCategory = (id: string) =>
	api.delete<ApiResponse<void>>(`/product/categories/${id}/`);
