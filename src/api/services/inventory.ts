import { api } from '../client';
import { ApiResponse } from '../../types/api';
import { DashboardData } from '../../types/api';
import { StockSummary, LowStockItem } from '../../types/inventory';

export const getDashboard = () =>
  api.get<ApiResponse<DashboardData>>('/inventry/dashboard');

export const getStockSummary = () =>
  api.get<ApiResponse<StockSummary>>('/inventry/stock-summary');

export const getLowStock = () =>
  api.get<ApiResponse<LowStockItem[]>>('/inventry/low-stock');
