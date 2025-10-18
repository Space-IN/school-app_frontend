import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './navigation/protectedRoute';
import * as NavigationBar from "expo-navigation-bar";

// Optional: Ignore specific warning logs
LogBox.ignoreLogs(['ViewPropTypes']);



export default function App() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#9c1006")
    NavigationBar.setButtonStyleAsync("light")
  }, [])

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#ac1d1dff" />

        <NavigationContainer>
          <ProtectedRoute />
        </NavigationContainer>
        
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
