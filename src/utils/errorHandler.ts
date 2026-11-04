import axios from "axios";

export const getErrorMessage = <T>(error: T): string => {
	if (!error) return "An unknown error occurred";
	if (axios.isAxiosError(error)) {
		const serverMsg = (error.response?.data as { message?: string } | undefined)
			?.message;
		if (serverMsg) return serverMsg;
		if (error.message) return error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "Something went wrong. Please try again.";
};
