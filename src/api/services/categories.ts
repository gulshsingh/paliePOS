import type { ApiResponse } from "../../types/api";
import type { Category } from "../../types/category";
import { api } from "../client";

export const getCategories = async (cursor?: string | null) => {
	const res = await api.get<ApiResponse<Category[]>>("/product/categories/", {
		params: cursor ? { cursor } : {},
	});
	return res.data.data;
};

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
