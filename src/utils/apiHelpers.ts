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
export function extractList<T = any>(pageData: unknown): T[] {
	const d = pageData as any;
	return d?.data?.data?.data ?? d?.data?.data ?? d?.data ?? d ?? [];
}

/**
 * Unwraps a single paginated query page (infinite query lastPage.data).
 * Same nesting logic, but scoped to one page object from useInfiniteQuery.
 */
export function extractPageList<T = any>(page: { data: unknown }): T[] {
	return extractList<T>(page.data);
}
