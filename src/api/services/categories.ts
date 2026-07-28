import { api } from '../client';
import { ApiResponse } from '../../types/api';
import { Category } from '../../types/category';

export const getCategories = async (cursor?: string | null) => {
  const res = await api.get<ApiResponse<Category[]>>("/product/categories/", {
    params: cursor ? { cursor } : {},
  });
  return res.data.data;
};

export const createCategory = (data: Partial<Category>) =>
  api.post<ApiResponse<Category>>('/categories', data);

export const updateCategory = (id: string, data: Partial<Category>) =>
  api.put<ApiResponse<Category>>(`/categories/${id}`, data);

export const deleteCategory = (id: string) =>
  api.delete<ApiResponse<void>>(`/categories/${id}`);
