import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { login } from "../../api/services/auth";
import { useAuth } from "../../navigation/AppNavigator";
import { loginSchema } from "../../schemas/auth/loginSchema";
import { usePermissionStore } from "../../store/permissionStore";
import { theme } from "../../theme";
import { startGoogleSignIn } from "../../utils/googleAuth";
import { styles } from "./LoginScreen.styles";

export default function LoginScreen({ navigation }: any) {
	const { signIn } = useAuth();
	const qc = useQueryClient();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [googleLoading, setGoogleLoading] = useState(false);
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
			qc.clear();
			const d = res.data as any;
			const token =
				d?.data?.data?.session?.access_token ||
				d?.data?.session?.access_token ||
				d?.data?.data?.access_token ||
				d?.data?.access_token ||
				d?.data?.token ||
				d?.data?.data?.token ||
				d?.token;
			if (!token) {
				setErrors({
					general: "Invalid response from server — please try again",
				});
				return;
			}

			// Extract role_id from login response (data.data.profile.role_id)
			const roleId =
				d?.data?.data?.profile?.role_id ||
				d?.data?.profile?.role_id ||
				d?.data?.data?.user?.role_id ||
				d?.data?.user?.role_id;
			const profile = d?.data?.data?.profile || d?.data?.profile;

			await AsyncStorage.setItem("token", token);
			if (roleId) {
				await AsyncStorage.setItem("role_id", roleId);
				usePermissionStore.getState().setRoleId(roleId);
			}
			if (profile) {
				await AsyncStorage.setItem("user_profile", JSON.stringify(profile));
			}

			signIn(token, roleId);
		} catch (e: any) {
			const code = e.response?.data?.error_code;
			const msg =
				code === "LOGIN_FAILED" || code === "AUTH_LOGIN_FAILED"
					? "Please check your email and password"
					: e.response?.data?.message ||
						(e.message === "Network Error"
							? "Network error: Phone ka internet connection check karein"
							: e.message) ||
						"Login failed";
			setErrors({ general: msg });
		} finally {
			setLoading(false);
		}
	};

	// ── Google Login (In-App Popup) ────────────────────────
	const handleGoogleLogin = async () => {
		setGoogleLoading(true);
		setErrors({});

		try {
			const res = await startGoogleSignIn();
			if (res.success && res.token) {
				qc.clear();
				await signIn(res.token);
			} else if (res.canceled) {
				// User closed popup
			} else if (res.error) {
				setErrors({ general: res.error });
			}
		} catch (error: any) {
			console.log("[google login] error:", error?.message ?? error);
			setErrors({
				general: "Google login open nahi ho paya. Please try again.",
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
					<Text style={styles.heading}>Welcome back</Text>
					<Text style={styles.subheading}>Sign in to your account</Text>

					{/* General Error Banner */}
					{errors.general ? (
						<View style={styles.errorBox}>
							<MaterialCommunityIcons
								name="alert-circle-outline"
								size={18}
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
							Boolean(errors.email) && styles.inputError,
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
							placeholder="you@restaurant.com"
							placeholderTextColor={theme.colors.textMuted}
							value={email}
							onChangeText={(t) => {
								setEmail(t);
								if (errors.email)
									setErrors((prev) => ({ ...prev, email: undefined }));
							}}
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							editable={!loading}
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
							Boolean(errors.password) && styles.inputError,
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
							placeholder="••••••••"
							placeholderTextColor={theme.colors.textMuted}
							value={password}
							onChangeText={(t) => {
								setPassword(t);
								if (errors.password)
									setErrors((prev) => ({ ...prev, password: undefined }));
							}}
							secureTextEntry={!showPassword}
							editable={!loading}
							onFocus={() => setFocusedField("password")}
							onBlur={() => setFocusedField(null)}
						/>
						<TouchableOpacity
							style={styles.eyeBtn}
							onPress={() => setShowPassword(!showPassword)}
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

					{/* Forgot Password */}
					<TouchableOpacity
						style={styles.forgotBtn}
						onPress={() => navigation.navigate("ForgotPassword")}
						disabled={loading}
					>
						<Text style={styles.forgotText}>Forgot Password?</Text>
					</TouchableOpacity>

					{/* Submit Button */}
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
								<Text style={styles.buttonText}>Sign In</Text>
								<MaterialCommunityIcons
									name="arrow-right"
									size={18}
									color="#fff"
								/>
							</>
						)}
					</TouchableOpacity>

					{/* Google Login Button (Native Popup) */}
					<TouchableOpacity
						style={[
							styles.button,
							styles.buttonGoogle,
							googleLoading && styles.buttonDisabled,
						]}
						onPress={handleGoogleLogin}
						disabled={loading || googleLoading}
						activeOpacity={0.85}
					>
						{googleLoading ? (
							<ActivityIndicator color={theme.colors.primary} size="small" />
						) : (
							<>
								<MaterialCommunityIcons
									name="google"
									size={20}
									color="#EA4335"
								/>
								<Text style={styles.buttonGoogleText}>Sign in with Google</Text>
							</>
						)}
					</TouchableOpacity>

					{/* Divider */}
					<View style={styles.dividerRow}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>or</Text>
						<View style={styles.dividerLine} />
					</View>

					{/* Sign Up line */}
					<TouchableOpacity
						style={styles.signupRow}
						onPress={() => navigation.navigate("Signup")}
						disabled={loading}
						activeOpacity={0.7}
					>
						<Text style={styles.signupText}>
							Don't have an account?{" "}
							<Text style={styles.signupLink}>Sign Up</Text>
						</Text>
					</TouchableOpacity>

					<Text style={styles.version}>Version 1.0.0</Text>
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	);
}
