import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Customer } from "./customer";
import type { Product } from "./product";
import type { RestaurantTable } from "./table";

export type RootStackParamList = {
	Main: { resetToMenu?: number; screen?: keyof MainTabParamList } | undefined;
	Auth: undefined;
	ProceedPayment: {
		customer?: Customer | null;
		table?: RestaurantTable | null;
	} | undefined;
	CustomerForm: { customer?: Customer } | undefined;
	ProductForm: { product?: Product } | undefined;
	TableForm: { table?: RestaurantTable } | undefined;
	RunningOrders: undefined;
};

export type AuthStackParamList = {
	Login: undefined;
	Signup: undefined;
	VerifyEmail: { email?: string } | undefined;
	CompleteProfile: { token_hash?: string; type?: string; email?: string } | undefined;
	ForgotPassword: undefined;
};

export type MainTabParamList = {
	Counter: undefined;
	Products: undefined;
	Tables: undefined;
	Settings: { resetToMenu?: number } | undefined;
};

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavProp = BottomTabNavigationProp<MainTabParamList>;

export type RootRouteProp<T extends keyof RootStackParamList> = RouteProp<
	RootStackParamList,
	T
>;
export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<
	AuthStackParamList,
	T
>;
