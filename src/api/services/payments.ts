import { api } from '../client';
import { ApiResponse } from '../../types/api';
import { CreatePaymentPayload } from '../../types/api';

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
  api.post<ApiResponse<Payment>>('/payments', data);

export const getPayments = (orderId: string) =>
  api.get<ApiResponse<Payment[]>>(`/payments`, { params: { order_id: orderId } });
