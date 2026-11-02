import { useQuery } from "@tanstack/react-query";
import { getCurrentSubscription } from "../api/services/subscriptions";

export const SUBSCRIPTION_QUERY_KEY = ["subscription"];

export function useCurrentSubscription(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: SUBSCRIPTION_QUERY_KEY,
		queryFn: () => getCurrentSubscription(),
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
		...options,
	});
}
