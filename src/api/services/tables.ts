import { api } from '../client';
import { ApiResponse } from '../../types/api';
import { RestaurantTable } from '../../types/table';

export const getTables = () =>
  api.get<ApiResponse<RestaurantTable[]>>('/tables');

export const getTable = (id: string) =>
  api.get<ApiResponse<RestaurantTable>>(`/tables/${id}`);

export const createTable = (data: Partial<RestaurantTable>) =>
  api.post<ApiResponse<RestaurantTable>>('/tables', data);

export const updateTable = (id: string, data: Partial<RestaurantTable>) =>
  api.put<ApiResponse<RestaurantTable>>(`/tables/${id}`, data);

export const deleteTable = (id: string) =>
  api.delete<ApiResponse<void>>(`/tables/${id}`);
