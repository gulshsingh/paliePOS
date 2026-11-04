import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	type NativeSyntheticEvent,
	Platform,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	type TextInputKeyPressEventData,
	TouchableOpacity,
	View,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { verifyEmail, verifyOtp } from "../../api/services/auth";
import { theme } from "../../theme";
import type {
	AuthNavigationProp,
	AuthRouteProp,
} from "../../types/navigation";
import { styles } from "./VerifyEmailScreen.styles";

const OTP_LENGTH = 6;
const OTP_SLOTS = [
	"slot-0",
	"slot-1",
	"slot-2",
	"slot-3",
	"slot-4",
	"slot-5",
];

export default function VerifyEmailScreen({
	navigation,
	route,
}: {
	navigation: AuthNavigationProp;
	route: AuthRouteProp<"VerifyEmail">;
}) {
	const email = route?.params?.email ?? "";

	const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

	const inputs = useRef<Array<TextInput | null>>([]);

	// Auto-focus first box
	useEffect(() => {
		const t = setTimeout(() => inputs.current[0]?.focus(), 400);
		return () => clearTimeout(t);
	}, []);

	const handleChange = (value: string, index: number) => {
		// Pasting multi-char (pura code ek jagah aa jaye)
		if (value.length > 1) {
			const cleaned = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
			const arr = Array(OTP_LENGTH).fill("");
			cleaned.split("").forEach((c, i) => {
				arr[i] = c;
			});
			setOtp(arr);
			setError(null);
			const next = Math.min(cleaned.length, OTP_LENGTH - 1);
			inputs.current[next]?.focus();
			return;
		}

		const char = value.replace(/\D/g, "");
		const arr = [...otp];
		arr[index] = char;
		setOtp(arr);
		setError(null);

		// Auto advance
		if (char && index < OTP_LENGTH - 1) {
			inputs.current[index + 1]?.focus();
		}
	};

	const handleKeyPress = (
		e: NativeSyntheticEvent<TextInputKeyPressEventData>,
		index: number,
	) => {
		// Backspace pe pehle empty box pe jao
		if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
			inputs.current[index - 1]?.focus();
		}
	};

	const code = otp.join("");

	const handleVerify = async () => {
		if (code.length < OTP_LENGTH) {
			setError("Please enter the full 6-digit code");
			return;
		}
		if (!email) {
			setError("Email missing — go back and sign up again");
			return;
		}
		setLoading(true);
		setError(null);
		try {
			const res = await verifyOtp({ email, token: code });
			const d = res.data as {
				success?: boolean;
				message?: string;
				access_token?: string;
				data?: {
					error?: { message?: string };
					access_token?: string;
					data?: { access_token?: string };
				};
			};

			if (d?.success === false) {
				setError(
					d?.message || d?.data?.error?.message || "Invalid or expired code",
				);
				return;
			}

			const accessToken =
				d?.data?.data?.access_token ||
				d?.data?.access_token ||
				d?.access_token;

			if (accessToken) {
				await AsyncStorage.setItem("token", accessToken);
			}

			try {
				await verifyEmail({});
			} catch (verifyErr) {
				console.log(
					"[verify-email] warn:",
					(verifyErr as { message?: string })?.message ?? String(verifyErr),
				);
			}

			setSuccessMsg("Email verified successfully ✅");

			setTimeout(() => {
				navigation.navigate("CompleteProfile", { email });
			}, 600);
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
			const code_ = err.response?.data?.error_code;
			const msg =
				err.response?.data?.message ||
				err.response?.data?.error?.message ||
				err.message;

			if (
				status === 400 ||
				status === 401 ||
				status === 404 ||
				code_ === "INVALID_OTP" ||
				code_ === "OTP_EXPIRED"
			) {
				setError("Invalid or expired code — check your email again");
			} else if (!err.response) {
				setError("Network error — check your connection");
			} else {
				setError(msg || "Verification failed — try again");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleUseAnotherEmail = () => {
		navigation.navigate("Signup");
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
					{/* Icon */}
					<View style={styles.mailIconWrap}>
						<MaterialCommunityIcons
							name="email-check-outline"
							size={44}
							color={theme.colors.primary}
						/>
					</View>

					<Text style={styles.heading}>Enter verification code</Text>
					<Text style={styles.subheading}>We sent a 6-digit code to</Text>
					{email ? <Text style={styles.email}>{email}</Text> : null}

					{/* General error */}
					{error ? (
						<View style={styles.errorBox}>
							<MaterialCommunityIcons
								name="alert-circle-outline"
								size={16}
								color={theme.colors.danger}
							/>
							<Text style={styles.errorBoxText}>{error}</Text>
						</View>
					) : null}

					{/* Success */}
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

					{/* OTP boxes */}
					<View style={styles.otpRow}>
						{OTP_SLOTS.map((slotId, i) => {
							const digit = otp[i];
							return (
								<TextInput
									key={slotId}
									ref={(r) => {
										inputs.current[i] = r;
									}}
									style={[
										styles.otpBox,
										focusedIndex === i && styles.otpBoxFocused,
										error && styles.otpBoxError,
									]}
									value={digit}
									onChangeText={(v) => handleChange(v, i)}
									onKeyPress={(e) => handleKeyPress(e, i)}
									onFocus={() => setFocusedIndex(i)}
									onBlur={() => setFocusedIndex(null)}
									keyboardType="number-pad"
									maxLength={OTP_LENGTH}
									textAlign="center"
									selectionColor={theme.colors.primary}
								/>
							);
						})}
					</View>

					{/* Verify button */}
					<TouchableOpacity
						style={[
							styles.button,
							(loading || code.length < OTP_LENGTH) && styles.buttonDisabled,
						]}
						onPress={handleVerify}
						disabled={loading || code.length < OTP_LENGTH}
						activeOpacity={0.85}
					>
						{loading ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<>
								<Text style={styles.buttonText}>Verify Email</Text>
								<MaterialCommunityIcons
									name="arrow-right"
									size={20}
									color="#fff"
								/>
							</>
						)}
					</TouchableOpacity>

					{/* Use another email */}
					<View style={styles.otherEmailRow}>
						<Text style={styles.otherEmailText}>Wrong email? </Text>
						<TouchableOpacity
							onPress={handleUseAnotherEmail}
							activeOpacity={0.7}
						>
							<Text style={styles.otherEmailLink}>Use another email</Text>
						</TouchableOpacity>
					</View>

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
							Already verified? <Text style={styles.loginLinkBold}>Login</Text>
						</Text>
					</TouchableOpacity>

					<Text style={styles.version}>Version 1.0.0</Text>
				</ScrollView>
			</View>
		</KeyboardAvoidingView>
	);
}
