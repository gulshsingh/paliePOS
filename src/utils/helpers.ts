export const sleep = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

export const isEmpty = (value: unknown): boolean => {
	if (value === null || value === undefined) return true;
	if (typeof value === "string") return value.trim().length === 0;
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === "object")
		return Object.keys(value as object).length === 0;
	return false;
};
