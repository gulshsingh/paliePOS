import type { ApiResponse, LoginPayload, LoginResponse } from "../../types/api";
import { api } from "../client";

export const login = (payload: LoginPayload) =>
	api.post<ApiResponse<LoginResponse>>("/auth/login", payload);

export const getProfile = () =>
	api.get<ApiResponse<LoginResponse["user"]>>("/auth/profile");
