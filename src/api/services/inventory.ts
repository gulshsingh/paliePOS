import type { ApiResponse, DashboardData } from "../../types/api";
import type { LowStockItem, StockSummary } from "../../types/inventory";
import { api } from "../client";

export const getDashboard = () =>
	api.get<ApiResponse<DashboardData>>("/inventry/dashboard");

export const getStockSummary = () =>
	api.get<ApiResponse<StockSummary>>("/inventry/stock-summary");

export const getLowStock = () =>
	api.get<ApiResponse<LowStockItem[]>>("/inventry/low-stock");
