import { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { verifyEmail, verifyOtp } from '../../api/services/auth';
import { theme } from '../../theme';

const OTP_LENGTH = 6;

export default function VerifyEmailScreen({ navigation, route }: any) {
  const email = route?.params?.email ?? '';

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
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
      const cleaned = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const arr = Array(OTP_LENGTH).fill('');
      cleaned.split('').forEach((c, i) => (arr[i] = c));
      setOtp(arr);
      setError(null);
      const next = Math.min(cleaned.length, OTP_LENGTH - 1);
      inputs.current[next]?.focus();
      return;
    }

    const char = value.replace(/\D/g, '');
    const arr = [...otp];
    arr[index] = char;
    setOtp(arr);
    setError(null);

    // Auto advance
    if (char && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Backspace pe pehle empty box pe jao
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const code = otp.join('');

  const handleVerify = async () => {
    if (code.length < OTP_LENGTH) {
      setError('Please enter the full 6-digit code');
      return;
    }
    if (!email) {
      setError('Email missing — go back and sign up again');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // ✅ Fix 1: verifyOtp (service ka actual naam)
      const res = await verifyOtp({ email, token: code });
      const d = res.data as any;

      if (d?.success === false) {
        setError(
          d?.message || d?.data?.error?.message || 'Invalid or expired code',
        );
        return;
      }

      // ✅ Fix 2: Token save — actual path:
      // d.data.data.access_token
      const accessToken =
        d?.data?.data?.access_token ||
        d?.data?.access_token ||
        d?.access_token;

            if (accessToken) {
        await AsyncStorage.setItem('token', accessToken);
      }

      // ✅ Naya step: POST /auth/verify-email
      // Bearer token header me jayega — client.ts interceptor
      // AsyncStorage se token khud attach kar dega
      try {
        await verifyEmail({});
      } catch (verifyErr: any) {
        // Verify-email fail hone pe bhi aage badho —
        // complete-profile khud decide karega allowed hai ya nahi
        console.log(
          '[verify-email] warn:',
          verifyErr?.response?.data || verifyErr?.message,
        );
      }

      setSuccessMsg('Email verified successfully ✅');

      // Next step: Complete Profile
      setTimeout(() => {
        navigation.navigate('CompleteProfile', { email });
      }, 600);
    } catch (e: any) {
      const status = e.response?.status;
      const code_ = e.response?.data?.error_code;
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error?.message ||
        e.message;

      if (
        status === 400 ||
        status === 401 ||
        status === 404 ||
        code_ === 'INVALID_OTP' ||
        code_ === 'OTP_EXPIRED'
      ) {
        setError('Invalid or expired code — check your email again');
      } else if (!e.response) {
        setError('Network error — check your connection');
      } else {
        setError(msg || 'Verification failed — try again');
      }
    } finally {
      setLoading(false);
    }
  };

  // Use another email → Signup page wapas
  const handleUseAnotherEmail = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={r => {
                  inputs.current[i] = r;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === i && styles.otpBoxFocused,
                  error && styles.otpBoxError,
                ]}
                value={digit}
                onChangeText={v => handleChange(v, i)}
                onKeyPress={e => handleKeyPress(e, i)}
                onFocus={() => setFocusedIndex(i)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                textAlign="center"
                selectionColor={theme.colors.primary}
              />
            ))}
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
            onPress={() => navigation.navigate('Login')}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.primary },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brand: { fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: 8 },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    letterSpacing: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  scroll: { paddingHorizontal: 28, paddingTop: 28, paddingBottom: 40 },
  mailIconWrap: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
  email: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 8,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSecondary,
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  otpBoxFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  otpBoxError: {
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerLight,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.dangerLight,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.danger,
  },
  errorBoxText: { color: theme.colors.danger, fontSize: 13, flex: 1 },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#16a34a',
  },
  successBoxText: { color: '#16a34a', fontSize: 13, flex: 1 },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    ...theme.shadow.lg,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  otherEmailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  otherEmailText: { color: theme.colors.textMuted, fontSize: 13 },
  otherEmailLink: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.border },
  dividerText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loginLink: { alignItems: 'center', paddingVertical: 6 },
  loginLinkText: { color: theme.colors.textMuted, fontSize: 14 },
  loginLinkBold: {
    color: theme.colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  version: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 28,
  },
});