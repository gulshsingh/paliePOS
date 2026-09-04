import type { ApiResponse } from "../../types/api";
import { api } from "../client";

export interface Invoice {
	id: string;
	order_id: string;
	invoice_number: string;
	total_amount: number;
	tax_amount: number;
	discount_amount: number;
	grand_total: number;
	amount_paid: number;
	balance: number;
	status: string;
	created_at: string;
}

export const getInvoices = (params?: {
	cursor?: string | null;
	limit?: number;
}) =>
	api.get<ApiResponse<{ data: Invoice[]; pagination: any }>>("/invoices", {
		params: { ...params, limit: params?.limit ?? 20 },
	});

export const getInvoice = (id: string) =>
	api.get<ApiResponse<Invoice>>(`/invoices/${id}`);

export interface InvoicePayload {
	order_id: string;
	account_id?: string | null;
	invoice_date?: string;
	payment_type?: string;
	paid_amount?: number;
	change_amount?: number;
	tax_amount?: number;
	discount_amount?: number;
}

export const generateInvoice = (payload: InvoicePayload) =>
	api.post<ApiResponse<Invoice>>("/invoices", payload);
