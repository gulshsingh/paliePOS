export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
}

export interface ApiResponse<T> {
	data: T;
	message: string;
	success: boolean;
}

export type ID = string;

export type Nullable<T> = T | null;
