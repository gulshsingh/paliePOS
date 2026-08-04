export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  const e = error as any;
  return e?.response?.data?.message
    ?? e?.message
    ?? 'Something went wrong. Please try again.';
};
