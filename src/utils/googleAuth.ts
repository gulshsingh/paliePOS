import {
	GoogleSignin,
	statusCodes,
} from "@react-native-google-signin/google-signin";

export const GOOGLE_WEB_CLIENT_ID =
	"253173380272-klj2hen8meo266e27r89tqu1gs40ueqk.apps.googleusercontent.com";

// Configure Google Sign-In SDK for 100% Native Popup (No browser)
GoogleSignin.configure({
	webClientId: GOOGLE_WEB_CLIENT_ID,
});

export interface GoogleAuthResult {
	success: boolean;
	token?: string;
	error?: string;
	canceled?: boolean;
	user?: any;
}

export const startGoogleSignIn = async (): Promise<GoogleAuthResult> => {
	try {
		// Ensure Google Play Services are available on the device
		await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

		// Trigger Native Android Bottom-Sheet Popup ("Choose an account")
		const response = await GoogleSignin.signIn();
		const userInfo = response?.data;
		const idToken = userInfo?.idToken;

		console.log("[Native Google Popup] Success:", userInfo?.user?.email);

		if (idToken) {
			return {
				success: true,
				token: idToken,
				user: userInfo?.user,
			};
		}

		return {
			success: true,
			user: userInfo?.user,
		};
	} catch (googleError: any) {
		console.log(
			"[Native Google Popup] Error:",
			googleError?.code,
			googleError?.message,
		);

		if (googleError.code === statusCodes.SIGN_IN_CANCELLED) {
			return { success: false, canceled: true };
		}
		if (googleError.code === statusCodes.IN_PROGRESS) {
			return { success: false };
		}
		if (googleError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
			return {
				success: false,
				error: "Google Play Services is not available.",
			};
		}

		// Common Google error codes:
		// 10 = DEVELOPER_ERROR (SHA-1 fingerprint missing in Google Cloud Console)
		if (googleError.code === "10" || String(googleError.message).includes("10")) {
			return {
				success: false,
				error:
					"Google Cloud Console mein SHA-1 add karna hoga: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25",
			};
		}

		return {
			success: false,
			error: googleError.message || "Google sign-in error.",
		};
	}
};
