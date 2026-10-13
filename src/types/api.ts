export interface ApiResponse<T> {
	data: T;
	message?: string;
	success: boolean;
	pagination?: {
		next_cursor: string | null;
		has_more: boolean;
		total?: number;
	};
}

export interface PaginatedResponse<T> {
	data: T[];
	pagination: {
		next_cursor: string | null;
		has_more: boolean;
		total?: number;
	};
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface LoginResponse {
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
		role: string;
		company_id: string;
	};
}

export interface CreateOrderPayload {
	table_id?: string | null;
	account_id?: string | null;
	total_amount: number;
	tax_amount: number;
	discount_amount: number;
	grand_total: number;
	items: {
		product_id: string;
		quantity: number;
		price: number;
		total: number;
	}[];
}

export interface UpdateItemStatusPayload {
	item_id: string;
	status: string;
}

export interface CreatePaymentPayload {
	invoice_id: string;
	paid_amount: number;
	change_amount: number;
	payment_method: string;
}

export interface DashboardData {
	total_orders_today: number;
	total_revenue_today: number;
	total_customers: number;
	total_products: number;
	orders_by_status: { status: string; count: number }[];
	recent_orders: any[];
}


export interface SignupPayload {
	email: string;
}

export interface SignupResponse {
	message?: string;
	user?: {
		id: string;
		email?: string;
		email_verified?: boolean;
		created_at?: string;
	};
}

export interface CompleteProfilePayload {
	full_name: string;
	phone: string;
	password: string;
	company_name: string;
	email?: string;
	token_hash?: string;
	type?: string;
}

export interface CompleteProfileResponse {
	message?: string;
	session?: {
		access_token?: string;
		refresh_token?: string;
	};
	access_token?: string;
	refresh_token?: string;
	user?: {
		id: string;
		email?: string;
	};
}

export interface VerifyOtpPayload {
	email: string;
	token: string;
}

export interface VerifyOtpResponse {
	message?: string;
	verified?: boolean;
	access_token?: string;
	refresh_token?: string;
	token_type?: string;
	expires_in?: number;
	user?: {
		id: string;
		email?: string;
		email_verified?: boolean;
	};
}

// ✅ Naya — POST /auth/verify-email (sirf Bearer token header se)
export interface VerifyEmailPayload {
	email?: string;
	token?: string;
}

export interface VerifyEmailResponse {
	message?: string;
	verified?: boolean;
	user?: {
		id: string;
		email?: string;
		email_verified?: boolean;
	};
}


export interface GoogleAuthResponse {
	url?: string;
	message?: string;
}