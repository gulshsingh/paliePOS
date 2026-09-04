import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { AppState, StyleSheet, View } from "react-native";
import { setUnauthorizedHandler } from "../api/client";

declare const atob: (encoded: string) => string;
import Loader from "../components/common/Loader";
import ProceedPaymentScreen from "../screens/counter/ProceedPaymentScreen";
import CustomerFormScreen from "../screens/customers/CustomerFormScreen";
import RunningOrdersScreen from "../screens/orders/RunningOrdersScreen";
import ProductFormScreen from "../screens/products/ProductFormScreen";
import TableFormScreen from "../screens/tables/TableFormScreen";
import { theme } from "../theme";
import { STORAGE_KEYS } from "../constants/storage";
import { useOrderStore } from "../store/orderStore";
import { useCartStore } from "../store/cartStore";
import { useFlowStore } from "../store/flowStore";
import { useCustomerStore } from "../store/customerStore";
import { useTableStore } from "../store/tableStore";
import AuthNavigator from "./AuthNavigator";
import MainTabNavigator from "./MainTabNavigator";

const IDLE_TIMEOUT = 30 * 60 * 1000;

interface AuthContextType {
	signIn: (token: string) => void;
	signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
};

const Stack = createNativeStackNavigator();

function useIdleTimer(onIdle: () => void) {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const appStateRef = useRef(AppState.currentState);

	const resetTimer = useCallback(() => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(onIdle, IDLE_TIMEOUT);
	}, [onIdle]);

	useEffect(() => {
		resetTimer();

		const sub = AppState.addEventListener("change", (next) => {
			if (appStateRef.current === "active" && next !== "active") {
				if (timerRef.current) clearTimeout(timerRef.current);
			} else if (next === "active") {
				resetTimer();
			}
			appStateRef.current = next;
		});

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			sub.remove();
		};
	}, [resetTimer]);

	return resetTimer;
}

// Shared slide-up + fade animation for all modal-style stack screens
const modalScreenOptions = {
	headerShown: false,
	animation: "slide_from_bottom" as const,
	contentStyle: { backgroundColor: theme.colors.surfaceSecondary },
	gestureEnabled: true,
	gestureDirection: "vertical" as const,
};

// Standard push animation for detail screens
const pushScreenOptions = {
	headerShown: false,
	animation: "slide_from_right" as const,
	contentStyle: { backgroundColor: theme.colors.surfaceSecondary },
};

// Decode the JWT payload and check its `exp` claim. Returns true for missing,
// malformed, or already-expired tokens so the app never flashes the main screen
// with a dead session before the API kicks it back to login.
function isTokenExpired(token: string | null): boolean {
	if (!token) return true;
	try {
		const payload = token.split(".")[1];
		if (!payload) return true;
		const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
		const json = decodeURIComponent(
			atob(padded)
				.split("")
				.map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
				.join(""),
		);
		const decoded = JSON.parse(json);
		if (typeof decoded?.exp !== "number") return true;
		return decoded.exp * 1000 <= Date.now();
	} catch {
		return true;
	}
}

export default function AppNavigator() {
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const queryClient = useQueryClient();

	useEffect(() => {
		AsyncStorage.getItem("token").then((t) => {
			if (t && !isTokenExpired(t)) {
				setToken(t);
			} else {
				// Expired/malformed token: drop it and go straight to login.
				if (t) AsyncStorage.removeItem("token");
				setToken(null);
			}
			setLoading(false);
		});
	}, []);

	const signIn = useCallback(async (newToken: string) => {
		if (!newToken) return;
		await AsyncStorage.setItem("token", newToken);
		setToken(newToken);
		queryClient.clear();
		useOrderStore.setState({ orders: [], activeOrderId: null, itemStatusOverrides: {} });
		useCartStore.setState({ cart: [] });
		useFlowStore.setState({ drafts: [], activeDraftId: null });
		useCustomerStore.setState({ selectedCustomer: null });
		useTableStore.setState({ selectedTable: null });
		await AsyncStorage.removeItem(STORAGE_KEYS.CART);
		await AsyncStorage.removeItem("palie-flow-drafts");
	}, [queryClient]);

	const signOut = useCallback(async () => {
		await AsyncStorage.removeItem("token");
		setToken(null);
		queryClient.clear();
	}, [queryClient]);

	// Register logout handler for API interceptor
	useEffect(() => {
		setUnauthorizedHandler(() => {
			setToken(null);
		});
	}, []);

	const resetIdle = useIdleTimer(signOut);

	if (loading) return <Loader />;

	return (
		<AuthContext.Provider value={{ signIn, signOut }}>
			<View
				style={styles.root}
				onTouchStart={resetIdle}
				onTouchMove={resetIdle}
				onTouchEnd={resetIdle}
			>
				<NavigationContainer>
					<Stack.Navigator
						screenOptions={{
							headerShown: false,
							contentStyle: { backgroundColor: theme.colors.surface },
						}}
					>
						{token ? (
							<>
								<Stack.Screen
									name="Main"
									component={MainTabNavigator}
									options={{ animation: "fade" }}
								/>
								<Stack.Screen
									name="ProceedPayment"
									component={ProceedPaymentScreen}
									options={modalScreenOptions}
								/>
								<Stack.Screen
									name="CustomerForm"
									component={CustomerFormScreen}
									options={modalScreenOptions}
								/>
								<Stack.Screen
									name="ProductForm"
									component={ProductFormScreen}
									options={modalScreenOptions}
								/>
								<Stack.Screen
									name="TableForm"
									component={TableFormScreen}
									options={modalScreenOptions}
								/>
								<Stack.Screen
									name="RunningOrders"
									component={RunningOrdersScreen}
									options={pushScreenOptions}
								/>
							</>
						) : (
							<Stack.Screen
								name="Auth"
								component={AuthNavigator}
								options={{ animation: "fade" }}
							/>
						)}
					</Stack.Navigator>
				</NavigationContainer>
			</View>
		</AuthContext.Provider>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
});
