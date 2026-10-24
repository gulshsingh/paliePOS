import { useState, useEffect } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useQueryClient } from "@tanstack/react-query";
import { completeProfile } from "../../api/services/auth";
import { useAuth } from "../../navigation/AppNavigator";
import { completeProfileSchema } from "../../schemas/auth/completeProfileSchema";
import { theme } from "../../theme";

export default function CompleteProfileScreen({ navigation, route }: any) {
	const { signIn } = useAuth();
	const qc = useQueryClient();

	// Params: OTP flow se email, deep link se token_hash/type (agar aaye)
	const email = route?.params?.email ?? "";
	const tokenHash = route?.params?.token_hash ?? route?.params?.token ?? "";
	const type = route?.params?.type ?? "";

	// Handle auto-login when arriving from Google OAuth callback deep link with access_token
	useEffect(() => {
		const accessToken = route?.params?.access_token;
		if (accessToken) {
			qc.clear();
			signIn(accessToken);
		}
	}, [route?.params?.access_token, signIn, qc]);

	const [fullName, setFullName] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [company, setCompany] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	const [errors, setErrors] = useState<{
		full_name?: string;
		phone?: string;
		password?: string;
		company_name?: string;
		general?: string;
	}>({});

	const validate = (): boolean => {
		const values = {
			full_name: fullName,
			phone,
			password,
			company_name: company,
		};
		const result = completeProfileSchema.safeParse(values);
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

	const handleSubmit = async () => {
		if (!validate()) return;
		setLoading(true);
		try {
			const res = await completeProfile({
				full_name: fullName.trim(),
				phone: phone.trim(),
				password,
				company_name: company.trim(),
				...(email ? { email } : {}),
				...(tokenHash ? { token_hash: tokenHash, type } : {}),
			});
			const d = res.data as any;

			if (d?.success === false) {
				setErrors({
					general:
						d?.message ||
						d?.data?.error?.message ||
						"Could not complete profile — try again",
				});
				return;
			}

			// ✅ Token path order fix + fallback:
			// 1. Response me token (jaise verify-otp me aaya tha — data.data.access_token)
			// 2. Session object ke andar
			// 3. Fallback: VerifyEmailScreen jo token AsyncStorage me save kar chuka tha
			const token =
				d?.data?.data?.access_token ||
				d?.data?.access_token ||
				d?.access_token ||
				d?.data?.data?.session?.access_token ||
				d?.data?.session?.access_token ||
				d?.session?.access_token ||
				(await AsyncStorage.getItem("token"));

			if (!token) {
				setErrors({
					general: "Invalid response from server — please try again",
				});
				return;
			}

			qc.clear();
			signIn(token); // auto login → Main screen
		} catch (e: any) {
			const status = e.response?.status;
			const code = e.response?.data?.error_code;
			const msg =
				e.response?.data?.message ||
				e.response?.data?.error?.message ||
				e.message;

			if (code === "WEAK_PASSWORD") {
				setErrors({
					password:
						msg || "Password too weak — use 8+ chars, uppercase & number",
				});
			} else if (status === 409 || code === "PROFILE_EXISTS") {
				setErrors({
					general: "Profile already completed — please login",
				});
			} else if (status === 400) {
				// 400 pe field kaunsa hai backend message se pata nahi — general dikhao
				setErrors({
					general: msg || "Please check your details and try again",
				});
			} else if (!e.response) {
				setErrors({ general: "Network error — check your connection" });
			} else {
				setErrors({
					general: msg || "Could not complete profile — try again",
				});
			}
		} finally {
			setLoading(false);
		}
	};

	// Reusable input field
	const renderField = (
		key: keyof typeof errors,
		label: string,
		icon: string,
		value: string,
		onChange: (v: string) => void,
		props: any = {},
	) => (
		<>
			<Text style={styles.label}>{label}</Text>
			<View
				style={[
					styles.inputRow,
					focusedField === key && styles.inputFocused,
					errors[key] && styles.inputError,
				]}
			>
				<MaterialCommunityIcons
					name={icon}
					size={20}
					color={
						errors[key]
							? theme.colors.danger
							: focusedField === key
								? theme.colors.primary
								: theme.colors.textMuted
					}
					style={styles.inputIcon}
				/>
				<TextInput
					style={styles.input}
					placeholderTextColor={theme.colors.textMuted}
					value={value}
					onChangeText={(v) => {
						onChange(v);
						setErrors((p) => ({ ...p, [key]: undefined }));
					}}
					onFocus={() => setFocusedField(key)}
					onBlur={() => setFocusedField(null)}
					{...props}
				/>
				{key === "password" ? (
					<TouchableOpacity
						onPress={() => setShowPassword(!showPassword)}
						style={styles.eyeBtn}
					>
						<MaterialCommunityIcons
							name={showPassword ? "eye-off-outline" : "eye-outline"}
							size={20}
							color={theme.colors.textMuted}
						/>
					</TouchableOpacity>
				) : null}
			</View>
			{errors[key] ? (
				<Text style={styles.fieldError}>{errors[key]}</Text>
			) : null}
		</>
	);

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
					<Text style={styles.heading}>Complete your profile</Text>
					<Text style={styles.subheading}>
						{email ? `Verified: ${email}` : "A few details and you're in"}
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

					{renderField(
						"full_name",
						"Full Name",
						"account-outline",
						fullName,
						setFullName,
						{
							placeholder: "e.g. Gulshan Thakur",
							autoCapitalize: "words",
						},
					)}

					{renderField(
						"phone",
						"Phone Number",
						"phone-outline",
						phone,
						setPhone,
						{
							placeholder: "9876543210",
							keyboardType: "phone-pad",
							maxLength: 15,
						},
					)}

					{renderField(
						"company_name",
						"Company / Restaurant Name",
						"store-outline",
						company,
						setCompany,
						{
							placeholder: "e.g. Palie Technologies",
							autoCapitalize: "words",
						},
					)}

					{renderField(
						"password",
						"Password",
						"lock-outline",
						password,
						setPassword,
						{
							placeholder: "Min 8 chars, 1 uppercase, 1 number",
							secureTextEntry: !showPassword,
						},
					)}

					{/* Submit */}
					<TouchableOpacity
						style={[styles.button, loading && styles.buttonDisabled]}
						onPress={handleSubmit}
						disabled={loading}
						activeOpacity={0.85}
					>
						{loading ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<>
								<Text style={styles.buttonText}>Continue</Text>
								<MaterialCommunityIcons
									name="arrow-right"
									size={20}
									color="#fff"
								/>
							</>
						)}
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.loginLink}
						onPress={() => navigation.navigate("Login")}
						activeOpacity={0.7}
					>
						<Text style={styles.loginLinkText}>
							Already completed?{" "}
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
		paddingTop: 48,
		paddingBottom: 24,
		paddingHorizontal: 24,
	},
	logoWrap: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "rgba(255,255,255,0.2)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	brand: { fontSize: 28, fontWeight: "900", color: "#fff", letterSpacing: 8 },
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
	scroll: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 40 },
	heading: { fontSize: 22, fontWeight: "800", color: theme.colors.textPrimary },
	subheading: {
		fontSize: 13,
		color: theme.colors.textMuted,
		marginTop: 4,
		marginBottom: 20,
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
	label: {
		fontSize: 13,
		fontWeight: "700",
		color: theme.colors.textSecondary,
		marginBottom: 6,
		letterSpacing: 0.3,
		marginTop: 4,
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
	eyeBtn: { padding: 4 },
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
		marginTop: 20,
		...theme.shadow.lg,
	},
	buttonDisabled: { opacity: 0.7 },
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "800",
		letterSpacing: 0.5,
	},
	loginLink: { alignItems: "center", marginTop: 18, paddingVertical: 6 },
	loginLinkText: { color: theme.colors.textMuted, fontSize: 14 },
	loginLinkBold: {
		color: theme.colors.primary,
		fontWeight: "800",
		fontSize: 14,
	},
	version: {
		textAlign: "center",
		color: theme.colors.textMuted,
		fontSize: 12,
		marginTop: 28,
	},
});