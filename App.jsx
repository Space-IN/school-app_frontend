import { NavigationContainer } from '@react-navigation/native';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/protectedRoute';

// Optional: Ignore specific warning logs
LogBox.ignoreLogs(['ViewPropTypes']);



export default function App() {

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="light-content" backgroundColor="#9c1006" />

        <NavigationContainer>
          <ProtectedRoute />
        </NavigationContainer>
        
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
