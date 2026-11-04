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

export interface GoogleAuthUser {
	id?: string;
	name?: string | null;
	email?: string;
	photo?: string | null;
	familyName?: string | null;
	givenName?: string | null;
}

export interface GoogleAuthResult {
	success: boolean;
	token?: string;
	error?: string;
	canceled?: boolean;
	user?: GoogleAuthUser | null;
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
	} catch (googleError) {
		const err = googleError as
			| { code?: string | number; message?: string }
			| undefined;
		console.log(
			"[Native Google Popup] Error:",
			err?.code,
			err?.message,
		);

		if (err?.code === statusCodes.SIGN_IN_CANCELLED) {
			return { success: false, canceled: true };
		}
		if (err?.code === statusCodes.IN_PROGRESS) {
			return { success: false };
		}
		if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
			return {
				success: false,
				error: "Google Play Services is not available.",
			};
		}

		// Common Google error codes:
		// 10 = DEVELOPER_ERROR (SHA-1 fingerprint missing in Google Cloud Console)
		if (err?.code === "10" || String(err?.message).includes("10")) {
			return {
				success: false,
				error:
					"Google Cloud Console mein SHA-1 add karna hoga: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25",
			};
		}

		return {
			success: false,
			error: err?.message || "Google sign-in error.",
		};
	}
};
