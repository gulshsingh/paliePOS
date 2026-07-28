import { api } from '../client';
import { ApiResponse, PaginatedResponse } from '../../types/api';
import { Product } from '../../types/product';

export const getProducts = (cursor?: string | null) =>
  api.get<ApiResponse<PaginatedResponse<Product>>>('/products', {
    params: { cursor, limit: 20 },
  });

export const getProduct = (id: string) =>
  api.get<ApiResponse<Product>>(`/products/${id}`);

export const createProduct = (data: Partial<Product>) =>
  api.post<ApiResponse<Product>>('/products', data);

export const updateProduct = (id: string, data: Partial<Product>) =>
  api.put<ApiResponse<Product>>(`/products/${id}`, data);

export const deleteProduct = (id: string) =>
  api.delete<ApiResponse<void>>(`/products/${id}`);
