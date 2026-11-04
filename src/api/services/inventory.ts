import type { ApiResponse } from "../../types/api";
import type {
	InventoryDashboardData,
	InventoryResponseWrapper,
	LowStockItem,
	StockSummary,
} from "../../types/inventory";
import { api } from "../client";

export const getDashboard = () =>
	api.get<ApiResponse<InventoryResponseWrapper<InventoryDashboardData>>>(
		"/inventry/dashboard",
	);

export const getStockSummary = () =>
	api.get<ApiResponse<InventoryResponseWrapper<StockSummary>>>(
		"/inventry/stock-summary",
	);

export const getLowStock = () =>
	api.get<ApiResponse<InventoryResponseWrapper<LowStockItem[]>>>(
		"/inventry/low-stock",
	);
