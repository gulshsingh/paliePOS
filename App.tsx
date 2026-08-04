import AppProviders from './src/app/AppProviders';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/app/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}