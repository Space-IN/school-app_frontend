import { createNativeStackNavigator } from "@react-navigation/native-stack"

import StudentParentTabs from './StudentParentTabs'
import SubjectDashboard from '../../screens/StudentParent/homescreen/SubjectDashboard'
import StudentProfileScreen from '../../screens/StudentParent/homescreen/StudentProfileScreen'
import AttendanceStudent from '../../screens/StudentParent/menuscreen/AttendanceScreen'
import TimetableScreen from '../../screens/StudentParent/menuscreen/TimetableScreen'
import NoticeBoardScreen from '../../screens/StudentParent/menuscreen/NoticeBoardScreen'
import ParentProfileScreen from '../../screens/StudentParent/menuscreen/ParentProfileScreen'
import AcademicCalendarScreen from '../../screens/StudentParent/menuscreen/AcademicCalendarScreen'
import SettingsScreen from '../../screens/StudentParent/menuscreen/settings/SettingsScreen'
import ExamDetailScreen from '../../screens/StudentParent/menuscreen/ExamDetailScreen'
import FeesScreen from '../../screens/StudentParent/menuscreen/settings/FeesScreen'
import ChangePasswordScreen from '../../screens/StudentParent/menuscreen/settings/ChangePasswordScreen'
import PrivacyPolicyScreen from '../../screens/StudentParent/menuscreen/settings/PrivacyPolicyScreen'
import TermsScreen from '../../screens/StudentParent/menuscreen/settings/TermsScreen'
import AboutScreen from '../../screens/StudentParent/menuscreen/settings/AboutScreen'
import StudentPerformanceScreen from '../../screens/StudentParent/menuscreen/StudentPerformanceScreen'



const Stack = createNativeStackNavigator()

export default function StudentNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="StudentParentTabs"
            screenOptions={{
                headerShown: true,
            }}
        >
            <Stack.Screen name="StudentParentTabs" component={StudentParentTabs} options={{ headerShown: false }} />
            <Stack.Screen name="SubjectDashboard" component={SubjectDashboard} />
            <Stack.Screen name="StudentProfileScreen" component={StudentProfileScreen} />
            <Stack.Screen name="AttendanceScreen" component={AttendanceStudent} />
            <Stack.Screen name="TimetableScreen" component={TimetableScreen} />
            <Stack.Screen name="NoticeBoardScreen" component={NoticeBoardScreen} />
            <Stack.Screen name="ParentProfileScreen" component={ParentProfileScreen} />
            <Stack.Screen name="AcademicCalendarScreen" component={AcademicCalendarScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
            <Stack.Screen name="FeesScreen" component={FeesScreen} />
            <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
            <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsScreen" component={TermsScreen} />
            <Stack.Screen name="AboutScreen" component={AboutScreen} />
            <Stack.Screen name="StudentPerformanceScreen" component={StudentPerformanceScreen} />
        </Stack.Navigator>
    )
}