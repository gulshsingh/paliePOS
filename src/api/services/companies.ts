import { api } from '../client';
import { ApiResponse } from '../../types/api';

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;
  tax_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export const getCompany = () =>
  api.get<ApiResponse<Company>>('/companies/me');

export const updateCompany = (data: Partial<Company>) =>
  api.put<ApiResponse<Company>>('/companies/me', data);
