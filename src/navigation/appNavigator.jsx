import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/authContext'
import AdminNavigator from './admin/adminNavigator'
import FacultyNavigator from './faculty/facultyNavigator'
import StudentTab from './student/studentTab'


export default function AppNavigator() {
  const { user, loading } = useAuth()

  if(loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#9c1006ff" />
      </View>
    )
  }

  switch(user.role) {
    case "Student":
      return <StudentTab />
    case "Faculty":
      return <FacultyNavigator />
    case "Admin":
      return <AdminNavigator />
  }
}