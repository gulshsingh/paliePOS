import type { ApiResponse, PaginationMeta } from "../../types/api";
import { api } from "../client";

export interface PaymentMode {
	id: string;
	name: string;
	notes?: string | null;
	created_at?: string;
	updated_at?: string;
	company_id?: string;
}

export const getPaymentModes = (params?: {
	cursor?: string | null;
	limit?: number;
}) =>
	api.get<ApiResponse<{ data: PaymentMode[]; pagination: PaginationMeta }>>(
		"/payment-modes/",
		{
			params: { ...params, limit: params?.limit ?? 20 },
		},
	);
