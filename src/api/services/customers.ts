import type { ApiResponse, PaginatedResponse } from "../../types/api";
import type { Customer } from "../../types/customer";
import { api } from "../client";

export const getCustomers = (cursor?: string | null, search?: string) =>
	api.get<ApiResponse<PaginatedResponse<Customer>>>("/accounts", {
		params: {
			limit: 20,
			...(cursor ? { cursor } : {}),
			...(search ? { search } : {}),
		},
	});

export const getCustomer = (id: string) =>
	api.get<ApiResponse<Customer>>(`/accounts/${id}`);

export const createCustomer = (data: Partial<Customer>) =>
	api.post<ApiResponse<Customer>>("/accounts", {
		account_type: "customer",
		...data,
	});

export const updateCustomer = (id: string, data: Partial<Customer>) =>
	api.put<ApiResponse<Customer>>(`/accounts/${id}`, {
		account_type: "customer",
		...data,
	});

export const deleteCustomer = (id: string) =>
	api.delete<ApiResponse<void>>(`/accounts/${id}`);
