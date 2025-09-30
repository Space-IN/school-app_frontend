import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/authContext'
import AdminNavigator from './admin/adminNavigator'
import FacultyNavigator from './faculty/facultyNavigator'
import StudentNavigator from './student/studentNavigator'



const Stack = createNativeStackNavigator();



export default function AppNavigator() {
  const { user, loading } = useAuth()

  if(loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    )
  }

  let initialRoute
  if(user?.role === "Student") {
    initialRoute = "StudentNavigator"
  } else if(user?.role === "Faculty") {
    initialRoute = "FacultyNavigator"
  } else if(user?.role === "Admin") {
    initialRoute = "AdminNavigator"
  }


  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="StudentNavigator" component={StudentNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="FacultyNavigator" component={FacultyNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="AdminNavigator" component={AdminNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}