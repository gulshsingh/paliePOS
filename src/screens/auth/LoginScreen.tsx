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
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { login } from "../../api/services/auth";
import { useAuth } from "../../navigation/AppNavigator";
import { loginSchema } from "../../schemas/auth/loginSchema";
import { theme } from "../../theme";

export default function LoginScreen() {
	const { signIn } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [focusedField, setFocusedField] = useState<string | null>(null);

	// Field-level errors
	const [errors, setErrors] = useState<{
		email?: string;
		password?: string;
		general?: string;
	}>({});

	const validate = (): boolean => {
		const result = loginSchema.safeParse({ email, password });
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

	const handleLogin = async () => {
		if (!validate()) return;
		setLoading(true);
		try {
			const res = await login({ email, password });
			const d = res.data as any;
			const token = d?.data?.data?.session?.access_token;
			if (!token) {
				setErrors({
					general: "Invalid response from server — please try again",
				});
				return;
			}
			signIn(token);
		} catch (e: any) {
			const code = e.response?.data?.error_code;
			const msg =
				code === "LOGIN_FAILED"
					? "Please check your email and password"
					: e.response?.data?.message || e.message || "Login failed";
			setErrors({ general: msg });
		} finally {
			setLoading(false);
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
					<Text style={styles.heading}>Login to your account</Text>
					<Text style={styles.subheading}>
						Enter your credentials to continue
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

					{/* Password */}
					<Text style={styles.label}>Password</Text>
					<View
						style={[
							styles.inputRow,
							focusedField === "password" && styles.inputFocused,
							errors.password && styles.inputError,
						]}
					>
						<MaterialCommunityIcons
							name="lock-outline"
							size={20}
							color={
								errors.password
									? theme.colors.danger
									: focusedField === "password"
										? theme.colors.primary
										: theme.colors.textMuted
							}
							style={styles.inputIcon}
						/>
						<TextInput
							style={styles.input}
							placeholder="Enter your password"
							placeholderTextColor={theme.colors.textMuted}
							value={password}
							onChangeText={(v) => {
								setPassword(v);
								setErrors((p) => ({ ...p, password: undefined }));
							}}
							secureTextEntry={!showPassword}
							onFocus={() => setFocusedField("password")}
							onBlur={() => setFocusedField(null)}
						/>
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
					</View>
					{errors.password ? (
						<Text style={styles.fieldError}>{errors.password}</Text>
					) : null}

					<TouchableOpacity style={styles.forgotBtn}>
						<Text style={styles.forgotText}>Forgot Password?</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.button, loading && styles.buttonDisabled]}
						onPress={handleLogin}
						disabled={loading}
						activeOpacity={0.85}
					>
						{loading ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<>
								<Text style={styles.buttonText}>Login</Text>
								<MaterialCommunityIcons
									name="arrow-right"
									size={20}
									color="#fff"
								/>
							</>
						)}
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
	eyeBtn: { padding: 4 },
	fieldError: {
		color: theme.colors.danger,
		fontSize: 11,
		fontWeight: "600",
		marginBottom: 12,
		marginTop: 2,
	},
	forgotBtn: { alignSelf: "flex-end", marginBottom: 24, marginTop: 4 },
	forgotText: { color: theme.colors.primary, fontSize: 13, fontWeight: "700" },
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
	version: {
		textAlign: "center",
		color: theme.colors.textMuted,
		fontSize: 12,
		marginTop: 32,
	},
});
