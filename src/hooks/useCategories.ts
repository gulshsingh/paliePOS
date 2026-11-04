import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from "../api/services/categories";
import { extractNextCursor } from "../utils/apiHelpers";

export function useCategories(limit = 50) {
	return useInfiniteQuery({
		queryKey: ["categories", limit],
		initialPageParam: null as string | null,
		queryFn: ({ pageParam }) => getCategories(pageParam, limit),
		getNextPageParam: (lastPage) => extractNextCursor(lastPage.data),
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createCategory,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
	});
}

export function useUpdateCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
			updateCategory(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
	});
}

export function useDeleteCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteCategory,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
	});
}
