import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/authContext';
import AdminNavigator from './admin/adminNavigator';
import FacultyNavigator from './faculty/facultyNavigator';
import StudentTab from './student/studentTab';
import { StudentProvider } from '../context/student/studentContext';
import LoginScreen from '../screens/auth/login';


export default function AppNavigator() {
  const { decodedToken, loading } = useAuth()

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

  switch(decodedToken?.realm_access.roles[0]) {
    case "student":
      return (
        <StudentProvider>
          <StudentTab />
        </StudentProvider>
      )
    case "faculty":
      return <FacultyNavigator />
    case "admin":
      return <AdminNavigator />
    default:
      return <LoginScreen />
  }
}