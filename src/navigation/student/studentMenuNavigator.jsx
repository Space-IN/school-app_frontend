import { createStackNavigator } from '@react-navigation/stack'
import MenuScreen from '../../screens/StudentParent/menuscreen/menuScreen'
import AttendanceScreen from '../../screens/StudentParent/menuscreen/attendanceScreen'
import TimetableScreen from '../../screens/StudentParent/menuscreen/timetableScreen'
import AssessmentScreen from '../../screens/StudentParent/menuscreen/assessmentScreen'
import AcademicCalendarScreen from '../../screens/StudentParent/menuscreen/academicCalendarScreen'
import FeesScreen from '../../screens/StudentParent/menuscreen/feesScreen'
import StudentHeader from '../../components/student/header'
import SettingsScreen from '../../screens/StudentParent/menuscreen/settingsScreen'
import OptScreen from '../../screens/auth/otpScreen'
import SetPasswordScreen from '../../screens/auth/setPasswordScreen'

const Stack = createStackNavigator()


export default function StudentMenuNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="menuScreen"
      screenOptions={{
          header: (props) => <StudentHeader {...props} />,
      }}
    >
      <Stack.Screen name="menuScreen" component={MenuScreen} />
      <Stack.Screen name="attendanceScreen" component={AttendanceScreen} />
      <Stack.Screen name="timetableScreen" component={TimetableScreen} options={{ headerShown: false }} />
      <Stack.Screen name="studentPerformanceScreen" component={AssessmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="academicCalendarScreen" component={AcademicCalendarScreen} />
      <Stack.Screen name="feesScreen" component={FeesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="settingsScreen" component={SettingsScreen} />
      <Stack.Screen name="otp" component={OptScreen} />
      <Stack.Screen name="setPassword" component={SetPasswordScreen} />
    </Stack.Navigator>
  )
}