import { createNativeStackNavigator } from "@react-navigation/native-stack"

import FacultyTabs from './FacultyTabs';
import FacultyClassDashboard from '../../screens/Faculty/classes/FacultyClassDashboard';
import FacultyStudentsScreen from '../../screens/Faculty/classes/FacultyStudentsScreen';
import FacultyAttendanceScreen from '../../screens/Faculty/classes/FacultyAttendanceScreen';
import FacultyAssignmentsScreen from '../../screens/Faculty/classes/FacultyAssignmentsScreen';
import FacultyTestsScreen from '../../screens/Faculty/classes/FacultyTestsScreen';
import ManagePerformanceTabs from "../../screens/Faculty/classes/performance/ManagePerformanceTabs";
import FacultyScheduleScreen from '../../screens/Faculty/schedule/FacultyScheduleScreen';
import FacultyProfileScreen from '../../screens/Faculty/profile/FacultyProfileScreen';
import ManagePerformanceTab from "../../screens/Faculty/classes/performance/ManagePerformanceTab";
import ViewPerformanceTab from "../../screens/Faculty/classes/performance/ViewPerformanceTab";
import StudentSubjectMarksScreen from "../../screens/Faculty/classes/performance/StudentSubjectMarksScreen";


const Stack = createNativeStackNavigator()

export default function FacultyNavigator() {

    return (
        <Stack.Navigator
            initialRouteName="FacultyTabs"
            screenOptions={{
                headerShown: true,
                headerBackTitleVisible: false,
            }}
        >
            <Stack.Screen name="FacultyTabs" component={FacultyTabs} options={{ headerShown: false }} />
            <Stack.Screen name="FacultyClassDashboard" component={FacultyClassDashboard} />
            <Stack.Screen name="FacultyStudentsScreen" component={FacultyStudentsScreen} />
            <Stack.Screen name="FacultyAttendanceScreen" component={FacultyAttendanceScreen} />
            <Stack.Screen name="FacultyAssignmentsScreen" component={FacultyAssignmentsScreen} />
            <Stack.Screen name="FacultyTestsScreen" component={FacultyTestsScreen} />
            <Stack.Screen name="FacultyPerformanceScreen" component={ManagePerformanceTabs} />
            <Stack.Screen name="FacultyScheduleScreen" component={FacultyScheduleScreen} />
            <Stack.Screen name="FacultyProfileScreen" component={FacultyProfileScreen} />
            <Stack.Screen name="ManagePerformanceTab" component={ManagePerformanceTab} />
            <Stack.Screen name="ViewPerformanceTab" component={ViewPerformanceTab} />
            <Stack.Screen name="StudentSubjectMarksScreen" component={StudentSubjectMarksScreen} />
        </Stack.Navigator>
    )
}