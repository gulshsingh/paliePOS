import type { CartItem } from "./cart";

export interface FlowDraft {
	id: string;
	items: CartItem[];
	table_id?: string | null;
	table_name?: string | null;
	customer_id?: string | null;
	customer_name?: string | null;
	note?: string;
	created_at: number;
	updated_at: number;
}

export interface FlowDraftInput {
	items: CartItem[];
	table_id?: string | null;
	table_name?: string | null;
	customer_id?: string | null;
	customer_name?: string | null;
	note?: string;
}
