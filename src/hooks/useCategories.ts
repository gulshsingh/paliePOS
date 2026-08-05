import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCategory,
	deleteCategory,
	getCategories,
	updateCategory,
} from "../api/services/categories";

export function useCategories() {
	return useQuery({
		queryKey: ["categories"],
		queryFn: () => getCategories(),
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
