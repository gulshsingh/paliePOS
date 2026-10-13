export interface SubscriptionPlan {
	id: string;
	name?: string;
	description?: string | null;
	price?: number;
	billing_interval?: string; // "monthly" | "yearly"
	features?: string[];
	max_users?: number;
	max_products?: number | null;
	max_daily_products?: number | null;
	max_daily_orders?: number | null;
	max_inventory_items?: number | null;
	has_inventory_access?: boolean;
	is_active?: boolean;
	created_at?: string;
}

export interface Subscription {
	id?: string;
	company_id?: string;
	user_id?: string;
	plan_id?: string;
	status?: string; // "active" | "cancelled" | "expired"
	starts_at?: string;
	started_at?: string;
	ends_at?: string;
	expires_at?: string;
	cancelled_at?: string | null;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
	plan?: SubscriptionPlan;
}

export interface PlanIdPayload {
	plan_id: string;
}