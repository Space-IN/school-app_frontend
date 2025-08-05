// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from 'react-native';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Optional: Ignore specific warning logs
LogBox.ignoreLogs(['ViewPropTypes']);

// ✅ Only declare App **once**
export default function App() {
  return (
    <>
      <SafeAreaProvider>

      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />

      </SafeAreaProvider>

    </>
  );
}
