import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createCustomer,
	deleteCustomer,
	getCustomers,
	updateCustomer,
} from "../api/services/customers";

export function useCustomers(search?: string) {
	return useInfiniteQuery({
		queryKey: ["customers", search],
		initialPageParam: null as string | null,
		queryFn: ({ pageParam }) => getCustomers(pageParam, search),
		getNextPageParam: (lastPage) =>
			lastPage.data.pagination?.next_cursor ?? undefined,
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateCustomer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createCustomer,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
	});
}

export function useUpdateCustomer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
			updateCustomer(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
	});
}

export function useDeleteCustomer() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteCustomer,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["customers"] }),
	});
}
