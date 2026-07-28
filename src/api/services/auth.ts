import { api } from '../client';
import { ApiResponse, LoginPayload, LoginResponse } from '../../types/api';

export const login = (payload: LoginPayload) =>
  api.post<ApiResponse<LoginResponse>>('/auth/login', payload);

export const getProfile = () =>
  api.get<ApiResponse<LoginResponse['user']>>('/auth/profile');
