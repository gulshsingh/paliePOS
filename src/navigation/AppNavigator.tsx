import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { View, AppState, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { setUnauthorizedHandler } from '../api/client';
import ProceedPaymentScreen from '../screens/counter/ProceedPaymentScreen';
import CustomerFormScreen from '../screens/customers/CustomerFormScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';
import TableFormScreen from '../screens/tables/TableFormScreen';
import RunningOrdersScreen from '../screens/orders/RunningOrdersScreen';
import Loader from '../components/common/Loader';
import { theme } from '../theme';

const IDLE_TIMEOUT = 30 * 60 * 1000;

interface AuthContextType {
  signIn: (token: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

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

    const sub = AppState.addEventListener('change', (next) => {
      if (appStateRef.current === 'active' && next !== 'active') {
        if (timerRef.current) clearTimeout(timerRef.current);
      } else if (next === 'active') {
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
  animation: 'slide_from_bottom' as const,
  contentStyle: { backgroundColor: theme.colors.surfaceSecondary },
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
};

// Standard push animation for detail screens
const pushScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  contentStyle: { backgroundColor: theme.colors.surfaceSecondary },
};

export default function AppNavigator() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('token').then((t) => {
      setToken(t);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (newToken: string) => {
    if (!newToken) return;
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.clear();
    setToken(null);
  }, []);

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
        onTouchEnd={resetIdle}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.surface },
            }}>
            {token ? (
              <>
                <Stack.Screen
                  name="Main"
                  component={MainTabNavigator}
                  options={{ animation: 'fade' }}
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
                options={{ animation: 'fade' }}
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
