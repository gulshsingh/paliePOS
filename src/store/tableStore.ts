import { create } from 'zustand';
import { RestaurantTable } from '../types/table';

interface TableStore {
  selectedTable: RestaurantTable | null;
  setSelectedTable: (table: RestaurantTable | null) => void;
}

export const useTableStore = create<TableStore>((set) => ({
  selectedTable: null,
  setSelectedTable: (table) => set({ selectedTable: table }),
}));
