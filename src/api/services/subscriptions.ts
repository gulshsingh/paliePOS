import type { ApiResponse } from "../../types/api";
import type {
	PlanIdPayload,
	Subscription,
	SubscriptionPlan,
} from "../../types/subscription";
import { api } from "../client";

// GET /api/subscriptions/current
export const getCurrentSubscription = () =>
	api.get<ApiResponse<Subscription>>("/subscriptions/current");

// GET /api/subscriptions/history 
export const getSubscriptionHistory = (cursor?: string) =>
	api.get<ApiResponse<Subscription[]>>("/subscriptions/history", {
		params: cursor ? { cursor } : undefined,
	});

// GET /api/plans
export const getPlans = () =>
	api.get<ApiResponse<SubscriptionPlan[]>>("/plans");

// POST /api/subscriptions/extend
export const extendSubscription = (payload: PlanIdPayload) =>
	api.post<ApiResponse<Subscription>>("/subscriptions/extend", payload);

// POST /api/subscriptions/subscribe
export const subscribeToPlan = (payload: PlanIdPayload) =>
	api.post<ApiResponse<Subscription>>("/subscriptions/subscribe", payload);

// POST /api/subscriptions/cancel
export const cancelSubscription = () =>
	api.post<ApiResponse<Subscription>>("/subscriptions/cancel");