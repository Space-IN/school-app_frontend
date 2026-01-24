import { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { LogBox } from 'react-native'
import Toast from 'react-native-toast-message'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from './context/authContext'
import * as NavigationBar from "expo-navigation-bar"
import RootNavigator from './navigation/rootNavigator'

// Optional: Ignore specific warning logs
LogBox.ignoreLogs(['ViewPropTypes'])



export default function App() {
  useEffect(() => {
    NavigationBar.setButtonStyleAsync("light")
  }, [])

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#ac1d1dff" translucent={false} />

        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
        
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
