// App.js (frontend)
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from 'react-native';

// Optional: Ignore specific warning logs
LogBox.ignoreLogs(['ViewPropTypes']); 

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
