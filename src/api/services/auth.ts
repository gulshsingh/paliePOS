import type {
	ApiResponse,
	CompleteProfilePayload,
	CompleteProfileResponse,
	LoginPayload,
	LoginResponse,
	SignupPayload,
	SignupResponse,
	VerifyEmailPayload,
	VerifyEmailResponse,
	VerifyOtpPayload,
	VerifyOtpResponse,
	GoogleAuthResponse
} from "../../types/api";
import { api } from "../client";

export const login = (payload: LoginPayload) =>
	api.post<ApiResponse<LoginResponse>>("/auth/login", payload);

export const signup = (payload: SignupPayload) =>
	api.post<ApiResponse<SignupResponse>>("/auth/signup", payload);

export const verifyOtp = (payload: VerifyOtpPayload) =>
	api.post<ApiResponse<VerifyOtpResponse>>("/auth/verify-otp", payload);

// POST /auth/verify-email — sirf Bearer token header se
// (token verify-otp ke response me milta hai, AsyncStorage me save hota hai,
//  client.ts interceptor apne attach kar deta hai)
export const verifyEmail = (payload: VerifyEmailPayload = {}) =>
	api.post<ApiResponse<VerifyEmailResponse>>("/auth/verify-email", payload);

export const completeProfile = (payload: CompleteProfilePayload) =>
	api.post<ApiResponse<CompleteProfileResponse>>(
		"/auth/complete-profile",
		payload,
	);

	export const getGoogleAuthUrl = () =>
	api.get<ApiResponse<GoogleAuthResponse>>("/auth/google");

export const getProfile = () =>
	api.get<ApiResponse<LoginResponse["user"]>>("/auth/profile");