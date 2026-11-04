import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createTable,
	deleteTable,
	getTables,
	updateTable,
} from "../api/services/tables";
import type { RestaurantTable } from "../types/table";
import { extractNextCursor } from "../utils/apiHelpers";

export function useTables(limit = 50) {
	return useInfiniteQuery({
		queryKey: ["tables", limit],
		initialPageParam: null as string | null,
		queryFn: ({ pageParam }) => getTables({ cursor: pageParam, limit }),
		getNextPageParam: (lastPage) => extractNextCursor(lastPage.data),
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateTable() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createTable,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
	});
}

export function useUpdateTable() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<RestaurantTable>;
		}) => updateTable(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
	});
}

export function useDeleteTable() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteTable,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["tables"] }),
	});
}
