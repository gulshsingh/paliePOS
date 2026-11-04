import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	type TextInputProps,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { completeProfile } from "../../api/services/auth";
import { useAuth } from "../../navigation/AppNavigator";
import { completeProfileSchema } from "../../schemas/auth/completeProfileSchema";
import { theme } from "../../theme";
import type {
	AuthNavigationProp,
	AuthRouteProp,
} from "../../types/navigation";
import { styles } from "./CompleteProfileScreen.styles";

export default function CompleteProfileScreen({
	navigation,
	route,
}: {
	navigation: AuthNavigationProp;
	route: AuthRouteProp<"CompleteProfile"> & {
		params?: {
			access_token?: string;
			email?: string;
			token_hash?: string;
			token?: string;
			type?: string;
		};
	};
}) {
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
			const d = res.data as {
				success?: boolean;
				message?: string;
				access_token?: string;
				session?: { access_token?: string };
				data?: {
					error?: { message?: string };
					access_token?: string;
					session?: { access_token?: string };
					data?: {
						access_token?: string;
						session?: { access_token?: string };
					};
				};
			};

			if (d?.success === false) {
				setErrors({
					general:
						d?.message ||
						d?.data?.error?.message ||
						"Could not complete profile — try again",
				});
				return;
			}

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
		} catch (e) {
			const err = e as {
				response?: {
					status?: number;
					data?: {
						error_code?: string;
						message?: string;
						error?: { message?: string };
					};
				};
				message?: string;
			};
			const status = err.response?.status;
			const code = err.response?.data?.error_code;
			const msg =
				err.response?.data?.message ||
				err.response?.data?.error?.message ||
				err.message;

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
				setErrors({
					general: msg || "Please check your details and try again",
				});
			} else if (!err.response) {
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
		props: TextInputProps = {},
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
