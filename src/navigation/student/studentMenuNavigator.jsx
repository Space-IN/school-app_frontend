import { createStackNavigator } from '@react-navigation/stack';
import MenuScreen from '../../screens/StudentParent/menuscreen/MenuScreen';
import SettingsScreen from '../../screens/StudentParent/menuscreen/settings/SettingsScreen';
import AttendanceScreen from '../../screens/StudentParent/menuscreen/AttendanceScreen';
import TimetableScreen from '../../screens/StudentParent/menuscreen/TimetableScreen';
import NoticeBoardScreen from '../../screens/StudentParent/menuscreen/NoticeBoardScreen';
import StudentPerformanceScreen from '../../screens/StudentParent/menuscreen/StudentPerformanceScreen';
import ParentProfileScreen from '../../screens/StudentParent/menuscreen/ParentProfileScreen';
import AcademicCalendarScreen from '../../screens/StudentParent/menuscreen/AcademicCalendarScreen';
import StudentProfileScreen from '../../screens/StudentParent/profilescreen/studentProfileScreen';
import FeesScreen from '../../screens/StudentParent/menuscreen/settings/FeesScreen';
import ChangePasswordScreen from '../../screens/StudentParent/menuscreen/settings/ChangePasswordScreen';
import PrivacyPolicyScreen from '../../screens/StudentParent/menuscreen/settings/PrivacyPolicyScreen';
import TermsScreen from '../../screens/StudentParent/menuscreen/settings/TermsScreen';
import AboutScreen from '../../screens/StudentParent/menuscreen/settings/AboutScreen';
import StudentHeader from '../../components/student/header';

const Stack = createStackNavigator();

export default function StudentMenuNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MenuScreen"
      screenOptions={{
          header: (props) => <StudentHeader {...props} />,
      }}
    >
      <Stack.Screen name="MenuScreen" component={MenuScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />
      <Stack.Screen name="TimetableScreen" component={TimetableScreen} />
      <Stack.Screen name="NoticeBoardScreen" component={NoticeBoardScreen} />
      <Stack.Screen name="StudentPerformanceScreen" component={StudentPerformanceScreen} />
      <Stack.Screen name="ParentProfileScreen" component={ParentProfileScreen} />
      <Stack.Screen name="AcademicCalendarScreen" component={AcademicCalendarScreen} />
      <Stack.Screen name="StudentProfileScreen" component={StudentProfileScreen} />
      <Stack.Screen name="FeesScreen" component={FeesScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
    </Stack.Navigator>
  );
}