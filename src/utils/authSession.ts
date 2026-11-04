import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { queryClient } from "../app/AppProviders";
import { useCartStore } from "../store/cartStore";
import { useCustomerStore } from "../store/customerStore";
import { useFlowStore } from "../store/flowStore";
import { useOrderStore } from "../store/orderStore";
import { usePermissionStore } from "../store/permissionStore";
import { useTableStore } from "../store/tableStore";

/**
 * Deep-clears all user, business, order, cart, query cache, and auth session data.
 * Triggered on user logout, session timeout, or 401 unauthorized.
 */
export async function clearAllAppState(): Promise<void> {
	try {
		// 1. Wipe TanStack Query in-memory cache so no stale data leaks to another session
		queryClient.clear();

		// 2. Clear all in-memory Zustand stores
		useCartStore.getState().clearCart();
		useCustomerStore.getState().setSelectedCustomer(null);
		useTableStore.getState().setSelectedTable(null);
		useFlowStore.getState().clearDrafts();
		useOrderStore.setState({
			orders: [],
			activeOrderId: null,
			itemStatusOverrides: {},
		});
		usePermissionStore.getState().clear();

		// 3. Wipe persistent storage on disk
		await AsyncStorage.clear();

		// 4. Disconnect Google session if active
		try {
			await GoogleSignin.signOut();
		} catch {
			// Ignore if not signed in with Google
		}
	} catch (error) {
		console.error("[clearAllAppState] Error clearing app state:", error);
	}
}
