import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Linking,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { signupSchema } from "../../schemas/auth/signupSchema";
import { theme } from "../../theme";
import { signup } from "../../api/services/auth";
import { useAuth } from "../../navigation/AppNavigator";
import { startGoogleSignIn } from "../../utils/googleAuth";

export default function SignupScreen({ navigation }: any) {
	const { signIn } = useAuth();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const [errors, setErrors] = useState<{
		email?: string;
		general?: string;
	}>({});

	const validate = (): boolean => {
		const result = signupSchema.safeParse({ email });
		if (!result.success) {
			const fieldErrors: typeof errors = {};
			result.error.errors.forEach((e) => {
				const field = e.path[0] as keyof typeof errors;
				if (!fieldErrors[field]) fieldErrors[field] = e.message;
			});
			setErrors(fieldErrors);
			return false;
		}
		setErrors({});
		return true;
	};

	const handleSignup = async () => {
		if (!validate()) return;
		setLoading(true);
		setSuccessMsg(null);
		try {
			const res = await signup({ email });
			const d = res.data as any;

			// Success: false wala case
			if (d?.success === false) {
				setErrors({
					general:
						d?.message ||
						d?.data?.error?.message ||
						"Signup failed — please try again",
				});
				return;
			}

			// Actual API response:
			// d.data.data.message → "Confirmation email sent successfully..."
			// d.data.data.user    → { id, email, email_verified: false, ... }
			const message =
				d?.data?.data?.message ||
				d?.message ||
				"Confirmation email sent successfully. Please check your inbox.";

			const userEmail = d?.data?.data?.user?.email || email;

			setSuccessMsg(message);
			setEmail("");

			// Verify Email (OTP) screen pe le jao
			navigation.navigate("VerifyEmail", { email: userEmail });
		} catch (e: any) {
			const status = e.response?.status;
			const code = e.response?.data?.error_code;
			const msg =
				e.response?.data?.message ||
				e.response?.data?.error?.message ||
				e.message;

			if (
				status === 409 ||
				code === "EMAIL_EXISTS" ||
				code === "USER_EXISTS" ||
				(typeof msg === "string" &&
					msg.toLowerCase().includes("already"))
			) {
				setErrors({ email: "This email is already registered" });
			} else if (status === 400 || status === 422) {
				setErrors({ email: msg || "Enter a valid email address" });
			} else if (!e.response) {
				setErrors({ general: "Network error — check your connection" });
			} else {
				setErrors({ general: msg || "Signup failed — please try again" });
			}
		} finally {
			setLoading(false);
		}
	};

	// ── Google Sign-Up (In-App Popup) ──────────────────────
	const handleGoogleSignUp = async () => {
		setGoogleLoading(true);
		setErrors({});
		setSuccessMsg(null);

		try {
			const res = await startGoogleSignIn();
			if (res.success && res.token) {
				await signIn(res.token);
			} else if (res.canceled) {
				// User closed the popup modal - no action needed
			} else if (res.error) {
				setErrors({ general: res.error });
			}
		} catch (error: any) {
			console.log("[google] error:", error?.message ?? error);
			setErrors({
				general: "Google sign-in open nahi ho paya. Please try again.",
			});
		} finally {
			setGoogleLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<StatusBar
				barStyle="light-content"
				backgroundColor={theme.colors.primary}
			/>

			{/* Hero */}
			<View style={styles.hero}>
				<View style={styles.logoWrap}>
					<MaterialCommunityIcons
						name="silverware-fork-knife"
						size={36}
						color="#fff"
					/>
				</View>
				<Text style={styles.brand}>PALIE</Text>
				<Text style={styles.tagline}>Restaurant POS System</Text>
			</View>

			{/* Card */}
			<View style={styles.card}>
				<ScrollView
					contentContainerStyle={styles.scroll}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<Text style={styles.heading}>Create your account</Text>
					<Text style={styles.subheading}>
						Enter your email to get started
					</Text>

					{/* General error */}
					{errors.general ? (
						<View style={styles.errorBox}>
							<MaterialCommunityIcons
								name="alert-circle-outline"
								size={16}
								color={theme.colors.danger}
							/>
							<Text style={styles.errorBoxText}>{errors.general}</Text>
						</View>
					) : null}

					{/* Success message */}
					{successMsg ? (
						<View style={styles.successBox}>
							<MaterialCommunityIcons
								name="check-circle-outline"
								size={16}
								color="#16a34a"
							/>
							<Text style={styles.successBoxText}>{successMsg}</Text>
						</View>
					) : null}

					{/* Email */}
					<Text style={styles.label}>Email Address</Text>
					<View
						style={[
							styles.inputRow,
							focusedField === "email" && styles.inputFocused,
							errors.email && styles.inputError,
						]}
					>
						<MaterialCommunityIcons
							name="email-outline"
							size={20}
							color={
								errors.email
									? theme.colors.danger
									: focusedField === "email"
										? theme.colors.primary
										: theme.colors.textMuted
							}
							style={styles.inputIcon}
						/>
						<TextInput
							style={styles.input}
							placeholder="you@example.com"
							placeholderTextColor={theme.colors.textMuted}
							value={email}
							onChangeText={(v) => {
								setEmail(v);
								setErrors((p) => ({ ...p, email: undefined }));
							}}
							keyboardType="email-address"
							autoCapitalize="none"
							onFocus={() => setFocusedField("email")}
							onBlur={() => setFocusedField(null)}
						/>
					</View>
					{errors.email ? (
						<Text style={styles.fieldError}>{errors.email}</Text>
					) : null}

					{/* Sign Up button */}
					<TouchableOpacity
						style={[styles.button, loading && styles.buttonDisabled]}
						onPress={handleSignup}
						disabled={loading}
						activeOpacity={0.85}
					>
						{loading ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<>
								<Text style={styles.buttonText}>Sign Up</Text>
								<MaterialCommunityIcons
									name="arrow-right"
									size={20}
									color="#fff"
								/>
							</>
						)}
					</TouchableOpacity>

					{/* Google Sign-Up */}
					<TouchableOpacity
						style={[styles.button, styles.buttonGoogle]}
						onPress={handleGoogleSignUp}
						disabled={googleLoading || loading}
						activeOpacity={0.85}
					>
						{googleLoading ? (
							<ActivityIndicator
								color={theme.colors.primary}
								size="small"
							/>
						) : (
							<>
								<MaterialCommunityIcons
									name="google"
									size={20}
									color="#DB4437"
								/>
								<Text style={styles.buttonGoogleText}>
									Continue with Google
								</Text>
							</>
						)}
					</TouchableOpacity>

					{/* Divider */}
					<View style={styles.dividerRow}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>or</Text>
						<View style={styles.dividerLine} />
					</View>

					{/* Back to Login */}
					<TouchableOpacity
						style={styles.loginLink}
						onPress={() => navigation.navigate("Login")}
						activeOpacity={0.7}
					>
						<Text style={styles.loginLinkText}>
							Already have an account?{" "}
							<Text style={styles.loginLinkBold}>Login</Text>
						</Text>
					</TouchableOpacity>

					<Text style={styles.version}>Version 1.0.0</Text>
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: theme.colors.primary },
	hero: {
		alignItems: "center",
		paddingTop: 64,
		paddingBottom: 32,
		paddingHorizontal: 24,
	},
	logoWrap: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 14,
	},
	brand: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: 8 },
	tagline: {
		fontSize: 13,
		color: "rgba(255,255,255,0.8)",
		marginTop: 4,
		letterSpacing: 1,
	},
	card: {
		flex: 1,
		backgroundColor: "#fff",
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
	},
	scroll: { paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40 },
	heading: { fontSize: 22, fontWeight: "800", color: theme.colors.textPrimary },
	subheading: {
		fontSize: 14,
		color: theme.colors.textMuted,
		marginTop: 4,
		marginBottom: 24,
	},
	errorBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: theme.colors.dangerLight,
		borderRadius: theme.radius.sm,
		paddingHorizontal: 14,
		paddingVertical: 10,
		marginBottom: 16,
		borderLeftWidth: 3,
		borderLeftColor: theme.colors.danger,
	},
	errorBoxText: { color: theme.colors.danger, fontSize: 13, flex: 1 },
	successBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: "#dcfce7",
		borderRadius: theme.radius.sm,
		paddingHorizontal: 14,
		paddingVertical: 10,
		marginBottom: 16,
		borderLeftWidth: 3,
		borderLeftColor: "#16a34a",
	},
	successBoxText: { color: "#16a34a", fontSize: 13, flex: 1 },
	label: {
		fontSize: 13,
		fontWeight: "700",
		color: theme.colors.textSecondary,
		marginBottom: 6,
		letterSpacing: 0.3,
	},
	inputRow: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.colors.surfaceSecondary,
		borderRadius: theme.radius.md,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		paddingHorizontal: 14,
		marginBottom: 4,
	},
	inputFocused: {
		borderColor: theme.colors.primary,
		backgroundColor: theme.colors.primaryLight,
	},
	inputError: {
		borderColor: theme.colors.danger,
		backgroundColor: theme.colors.dangerLight,
	},
	inputIcon: { marginRight: 10 },
	input: {
		flex: 1,
		color: theme.colors.textPrimary,
		fontSize: 15,
		paddingVertical: 14,
	},
	fieldError: {
		color: theme.colors.danger,
		fontSize: 11,
		fontWeight: "600",
		marginBottom: 12,
		marginTop: 2,
	},
	button: {
		backgroundColor: theme.colors.primary,
		paddingVertical: 16,
		borderRadius: theme.radius.md,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		...theme.shadow.lg,
	},
	buttonDisabled: { opacity: 0.7 },
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "800",
		letterSpacing: 0.5,
	},
	buttonGoogle: {
		backgroundColor: theme.colors.surfaceSecondary,
		borderWidth: 1.5,
		borderColor: theme.colors.border,
		marginTop: 12,
		shadowOpacity: 0,
		elevation: 0,
	},
	buttonGoogleText: {
		color: theme.colors.textPrimary,
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: 0.3,
	},
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
		gap: 12,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: theme.colors.border,
	},
	dividerText: {
		fontSize: 12,
		color: theme.colors.textMuted,
		fontWeight: "600",
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	loginLink: { alignItems: "center", paddingVertical: 6 },
	loginLinkText: { color: theme.colors.textMuted, fontSize: 14 },
	loginLinkBold: { color: theme.colors.primary, fontWeight: "800", fontSize: 14 },
	version: {
		textAlign: "center",
		color: theme.colors.textMuted,
		fontSize: 12,
		marginTop: 32,
	},
});