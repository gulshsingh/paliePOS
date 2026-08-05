import type { ApiResponse, PaginatedResponse } from "../../types/api";
import type { Customer } from "../../types/customer";
import { api } from "../client";

export const getCustomers = (cursor?: string | null, search?: string) =>
	api.get<ApiResponse<PaginatedResponse<Customer>>>("/accounts", {
		params: { cursor, limit: 20, ...(search ? { search } : {}) },
	});

export const getCustomer = (id: string) =>
	api.get<ApiResponse<Customer>>(`/accounts/${id}`);

export const createCustomer = (data: Partial<Customer>) =>
	api.post<ApiResponse<Customer>>("/accounts", data);

export const updateCustomer = (id: string, data: Partial<Customer>) =>
	api.put<ApiResponse<Customer>>(`/accounts/${id}`, data);

export const deleteCustomer = (id: string) =>
	api.delete<ApiResponse<void>>(`/accounts/${id}`);
