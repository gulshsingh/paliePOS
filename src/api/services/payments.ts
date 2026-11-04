import type {
	ApiResponse,
	CreatePaymentPayload,
	PaginationMeta,
} from "../../types/api";
import { api } from "../client";

export interface PaymentCreateResult {
	success: boolean;
}

export interface PaymentResponseData {
	pagination?: PaginationMeta | null;
	data?: PaymentCreateResult | boolean;
	error?: string | null;
}

export interface Payment {
	id: string;
	invoice_id: string;
	order_id?: string;
	amount: number;
	method: string;
	status: string;
	created_at: string;
}

export const createPayment = (data: CreatePaymentPayload) =>
	api.post<ApiResponse<PaymentResponseData>>("/payments", data);

export const getPayments = (orderId: string) =>
	api.get<ApiResponse<Payment[]>>("/payments", {
		params: { order_id: orderId },
	});
