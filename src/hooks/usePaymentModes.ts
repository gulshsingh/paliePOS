import { useQuery } from "@tanstack/react-query";
import {
	getPaymentModes,
	type PaymentMode,
} from "../api/services/paymentModes";
import { extractList } from "../utils/apiHelpers";

export function usePaymentModes() {
	const query = useQuery({
		queryKey: ["payment-modes"],
		queryFn: () => getPaymentModes(),
		staleTime: 5 * 60 * 1000,
	});

	const paymentModes: PaymentMode[] = query.data
		? extractList<PaymentMode>(query.data.data)
		: [];

	return {
		...query,
		paymentModes,
	};
}
