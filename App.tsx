import AppProviders from "./src/app/AppProviders";
import ErrorBoundary from "./src/app/ErrorBoundary";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
	return (
		<ErrorBoundary>
			<AppProviders>
				<AppNavigator />
			</AppProviders>
		</ErrorBoundary>
	);
}
