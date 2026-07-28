import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTables, createTable, updateTable, deleteTable } from '../api/services/tables';

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => getTables(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTable,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
}

export function useUpdateTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) => updateTable(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
}

export function useDeleteTable() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTable,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tables'] }),
  });
}
