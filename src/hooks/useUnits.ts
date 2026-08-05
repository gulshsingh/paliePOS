import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createUnit,
	deleteUnit,
	getUnits,
	updateUnit,
} from "../api/services/units";
import type { UnitPayload } from "../types/unit";

export function useUnits() {
	return useQuery({
		queryKey: ["units"],
		queryFn: () => getUnits(),
		staleTime: 5 * 60 * 1000,
	});
}

export function useCreateUnit() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createUnit,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["units"] }),
	});
}

export function useUpdateUnit() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UnitPayload }) =>
			updateUnit(id, data),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["units"] }),
	});
}

export function useDeleteUnit() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteUnit,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["units"] }),
	});
}
