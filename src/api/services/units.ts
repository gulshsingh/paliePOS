import { api } from '../client';
import { ApiResponse } from '../../types/api';
import { Unit, UnitPayload } from '../../types/unit';

export const getUnits = async (cursor?: string | null) => {
  const res = await api.get<ApiResponse<{ data: Unit[]; pagination: any }>>(
    '/product/unit',
    { params: cursor ? { cursor } : {} },
  );
  return res.data.data;
};

export const createUnit = (payload: UnitPayload) =>
  api.post<ApiResponse<Unit>>('/product/unit', payload);

export const updateUnit = (id: string, payload: UnitPayload) =>
  api.put<ApiResponse<Unit>>(`/product/unit/${id}`, payload);

export const deleteUnit = (id: string) =>
  api.delete<ApiResponse<void>>(`/product/unit/${id}`);
