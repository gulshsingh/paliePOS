export const isNetworkError = (error: unknown): boolean => {
  const e = error as any;
  return !e?.response && !!e?.request;
};

export const isUnauthorized = (error: unknown): boolean => {
  const e = error as any;
  return e?.response?.status === 401;
};

export const isBadRequest = (error: unknown): boolean => {
  const e = error as any;
  return e?.response?.status === 400;
};
