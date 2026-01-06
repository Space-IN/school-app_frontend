import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/authContext'
import AdminNavigator from './admin/adminNavigator'
import FacultyNavigator from './faculty/facultyNavigator'
import StudentTab from './student/studentTab'
import { StudentProvider } from '../context/studentContext'
import LoginScreen from '../screens/auth/loginScreen'


export default function AppNavigator() {
  const { decodedToken, loading } = useAuth()
  const roles = decodedToken?.realm_access.roles

  if(loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#9c1006ff" />
      </View>
    )
  }

  if(!decodedToken) {
    return <LoginScreen />
  }

  if(roles.includes("student")) {
    return (
      <StudentProvider>
        <StudentTab />
      </StudentProvider>
    )
  } else if(roles.includes("faculty")) {
    return <FacultyNavigator />
  } else if(roles.includes("admin")) {
    return <AdminNavigator />
  } else {
    return <LoginScreen />
  }
}