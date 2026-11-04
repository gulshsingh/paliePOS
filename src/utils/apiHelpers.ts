import type { PaginationMeta } from "../types/api";

type ResponsePayload =
	| {
			pages?: ResponsePayload[];
			data?: ResponsePayload;
			pagination?: PaginationMeta;
	  }
	| object
	| string
	| number
	| boolean
	| null
	| undefined;

/**
 * Unwraps the paginated list from API responses.
 *
 * The backend wraps responses in multiple shapes:
 *   { data: { data: { data: T[] } } }  (paginated)
 *   { data: { data: T[] } }
 *   { data: T[] }
 *   T[]
 *
 * This helper handles all variants so callers don't need to repeat the
 * `d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? d ?? []` chain.
 */
export function extractList<T>(pageData: ResponsePayload): T[] {
	if (!pageData) return [];

	// Direct array
	if (Array.isArray(pageData)) return pageData as T[];

	const d = pageData as {
		pages?: ResponsePayload[];
		data?: ResponsePayload;
	};

	// React Query infinite query result object: { pages: [...] }
	if (Array.isArray(d?.pages)) {
		return d.pages.flatMap((page: ResponsePayload) => extractList<T>(page));
	}

	// React Query wrapped in .data: { data: { pages: [...] } }
	const innerData = d?.data as
		| { pages?: ResponsePayload[]; data?: ResponsePayload }
		| undefined;
	if (Array.isArray(innerData?.pages)) {
		return innerData.pages.flatMap((page: ResponsePayload) =>
			extractList<T>(page),
		);
	}

	const nestedData = innerData?.data as { data?: ResponsePayload } | undefined;
	const candidate =
		(nestedData?.data as T[] | undefined) ??
		(innerData?.data as T[] | undefined) ??
		(d?.data as T[] | undefined);

	return Array.isArray(candidate) ? candidate : [];
}

/**
 * Unwraps a single paginated query page (infinite query lastPage.data).
 * Same nesting logic, but scoped to one page object from useInfiniteQuery.
 */
export function extractPageList<T>(page: { data: ResponsePayload }): T[] {
	return extractList<T>(page.data);
}

/**
 * Unwraps pagination info from API response.
 */
export function extractPagination(
	pageData: ResponsePayload,
): PaginationMeta | undefined {
	if (!pageData || typeof pageData !== "object") return undefined;
	const d = pageData as {
		pagination?: PaginationMeta;
		data?: {
			pagination?: PaginationMeta;
			data?: { pagination?: PaginationMeta };
		};
	};
	return d?.data?.pagination ?? d?.data?.data?.pagination ?? d?.pagination;
}

/**
 * Unwraps next_cursor from API response pagination regardless of nesting.
 */
export function extractNextCursor(
	pageData: ResponsePayload,
): string | undefined {
	const pagination = extractPagination(pageData);
	return pagination?.next_cursor ?? undefined;
}

/**
 * Safely extracts human-readable error message from an API or network error.
 */
export function getErrorMessage<T>(
	error: T,
	fallback = "An unexpected error occurred",
): string {
	if (!error) return fallback;
	if (typeof error === "string") return error;
	const e = error as {
		response?: {
			data?: {
				message?: string;
				error?: string;
				data?: { error?: { message?: string } };
			};
		};
		message?: string;
	};
	return (
		e?.response?.data?.message ||
		e?.response?.data?.data?.error?.message ||
		e?.response?.data?.error ||
		e?.message ||
		fallback
	);
}
