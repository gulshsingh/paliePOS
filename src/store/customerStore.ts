import { create } from "zustand";
import type { Customer } from "../types/customer";

interface CustomerStore {
	selectedCustomer: Customer | null;
	setSelectedCustomer: (customer: Customer | null) => void;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
	selectedCustomer: null,
	setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
}));
