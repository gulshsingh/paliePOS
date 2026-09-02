import {
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createProduct,
	deleteProduct,
	getProducts,
	updateProduct,
} from "../api/services/products";

export function useProducts() {
	return useInfiniteQuery({
		queryKey: ["products"],
		enabled: true,
		initialPageParam: null as string | null,
		queryFn: ({ pageParam }) => getProducts(pageParam),
		getNextPageParam: (lastPage) =>
			lastPage.data.pagination?.next_cursor ?? undefined,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useCreateProduct() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createProduct,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
	});
}

export function useUpdateProduct() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
			updateProduct(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
	});
}

export function useDeleteProduct() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteProduct,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
	});
}
