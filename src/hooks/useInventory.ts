import { useQuery } from '@tanstack/react-query';
import { getDashboard, getStockSummary, getLowStock } from '../api/services/inventory';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(),
    staleTime: 60 * 1000,
  });
}

export function useStockSummary() {
  return useQuery({
    queryKey: ['stock-summary'],
    queryFn: () => getStockSummary(),
    staleTime: 60 * 1000,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ['low-stock'],
    queryFn: () => getLowStock(),
    staleTime: 60 * 1000,
  });
}
