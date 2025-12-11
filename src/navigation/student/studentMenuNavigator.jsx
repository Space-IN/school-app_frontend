import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from '../../screens/StudentParent/menuscreen/MenuScreen';
import AttendanceScreen from '../../screens/StudentParent/menuscreen/attendanceScreen';
import SettingsScreen from '../../screens/StudentParent/menuscreen/settings/SettingsScreen';
import TimetableScreen from '../../screens/StudentParent/menuscreen/timetableScreen'
import AssessmentScreen from '../../screens/StudentParent/menuscreen/assessmentScreen';
import AcademicCalendarScreen from '../../screens/StudentParent/menuscreen/academicCalendarScreen';
import FeesScreen from '../../screens/StudentParent/menuscreen/feesScreen';
import PrivacyPolicyScreen from '../../screens/StudentParent/menuscreen/settings/PrivacyPolicyScreen';
import TermsScreen from '../../screens/StudentParent/menuscreen/settings/TermsScreen';
import AboutScreen from '../../screens/StudentParent/menuscreen/settings/AboutScreen';
import StudentHeader from '../../components/student/header';
import ChangePasswordScreen from '../../screens/StudentParent/menuscreen/settings/ChangePasswordScreen';

const Stack = createStackNavigator();

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
      <Stack.Screen name="settingsScreen" component={SettingsScreen} />
      <Stack.Screen name="academicCalendarScreen" component={AcademicCalendarScreen} />
      <Stack.Screen name="feesScreen" component={FeesScreen} />
      <Stack.Screen name="privacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="termsScreen" component={TermsScreen} />
      <Stack.Screen name="aboutScreen" component={AboutScreen} />
      <Stack.Screen name="changePasswordScreen" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
}