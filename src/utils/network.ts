import axios from "axios";

export const isNetworkError = (
	error: Error | object | string | null | undefined,
): boolean => {
	if (axios.isAxiosError(error)) {
		return !error.response && !!error.request;
	}
	return false;
};

export const isUnauthorized = (
	error: Error | object | string | null | undefined,
): boolean => {
	return axios.isAxiosError(error) && error.response?.status === 401;
};

export const isBadRequest = (
	error: Error | object | string | null | undefined,
): boolean => {
	return axios.isAxiosError(error) && error.response?.status === 400;
};
