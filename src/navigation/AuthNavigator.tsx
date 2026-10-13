import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CompleteProfileScreen from "../screens/auth/CompleteProfileScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import VerifyEmailScreen from "../screens/auth/VerifyEmailScreen";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerShown: false,
				animation: "fade",
				contentStyle: { backgroundColor: "#fff" },
			}}
		>
			<Stack.Screen name="Login" component={LoginScreen} />
			<Stack.Screen name="Signup" component={SignupScreen} />
			<Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
			<Stack.Screen
				name="CompleteProfile"
				component={CompleteProfileScreen}
			/>
		</Stack.Navigator>
	);
}