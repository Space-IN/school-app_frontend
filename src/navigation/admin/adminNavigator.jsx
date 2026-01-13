import { createNativeStackNavigator } from "@react-navigation/native-stack"

import AdminTabNavigator from '../../screens/Admin/AdminTabNavigator';
import AdminPosterManager from '../../screens/Admin/AdminDashboard/AdminPosterManager';

// Admin/Faculty Related imports
import AddFacultyScreen from '../../screens/Admin/FacultyManagement/AddFacultyScreen';
import AllFacultyScreen from '../../screens/Admin/FacultyManagement/AllFacultyScreen';
import EditFacultyScreen from '../../screens/Admin/FacultyManagement/EditFacultyScreen';
import DeletedFacultyScreen from '../../screens/Admin/FacultyManagement/DeletedFacultyScreen';
import FacultyPerformance from "../../screens/Admin/FacultyManagement/FacultyPerformance";
import FacultyListScreen from "../../screens/Admin/FacultyManagement/FacultyListScreen";
import FacultyScoreScreen from "../../screens/Admin/FacultyManagement/FacultyScoreScreen";
import FacultyProfileViewScreen from '../../screens/Admin/FacultyManagement/FacultyProfileViewScreen';

// Admin/Student related imports
import AddStudentScreen from '../../screens/Admin/StudentManagement/AddStudentScreen';
import AllStudentsScreen from '../../screens/Admin/StudentManagement/AllStudentsScreen';
import EditStudentScreen from '../../screens/Admin/StudentManagement/EditStudentScreen';
import FilteredStudentsScreen from '../../screens/Admin/StudentManagement/FilteredStudentsScreen';
import DeletedStudentsScreen from '../../screens/Admin/StudentManagement/DeletedStudentsScreen';
import AdminAttendanceScreen from '../../screens/Admin/StudentManagement/AdminAttendanceScreen';
import AdminStudentProfileView from "../../screens/Admin/StudentManagement/AdminStudentProfileView";

// Admin/classSchedule related imports
import ClassScheduleScreen from '../../screens/Admin/classScheduleManagement/ClassScheduleScreen';
import ClassScheduleViewScreen from '../../screens/Admin/classScheduleManagement/ClassScheduleViewScreen';

// Other screens
import BoardSelectionScreen from '../../screens/Admin/BoardSelectionScreen';
import AdminFeesScreen from "../../screens/Admin/fees/AdminFeesScreen";

// import AdminPosterManager from "../../screens/Admin/AdminPosterManager";

import AddEventScreen from "../../screens/Admin/Eventmanagement/AddEventScreen"
import AddNoticeScreen from "../../screens/Admin/NoticeManagement/AddNoticeScreen"
import AddSubjectMasterScreen from "../../screens/Admin/subjectManagement/AddSubjectMasterScreen"
import AssignSubjectScreen from "../../screens/Admin/subjectManagement/AssignSubjectScreen"


import { StatusBar } from "react-native";
import { SafeAreaFrameContext } from "react-native-safe-area-context";



// Report Card Imports
import ReportCardLandingScreen from '../../screens/Admin/ReportCard/ReportCardLandingScreen';
import ReportCardEditorScreen from '../../screens/Admin/ReportCard/ReportCardEditorScreen';

const Stack = createNativeStackNavigator()

export default function AdminNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="AdminDashboard"
            screenOptions={{
                headerShown: true,
                headerBackTitleVisible: false,
                headerStyle: { backgroundColor: '#9c1006' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="AdminDashboard" component={AdminTabNavigator} />
            <Stack.Screen name="AddStudentScreen" component={AddStudentScreen} />
            <Stack.Screen name="AddFacultyScreen" component={AddFacultyScreen} />
            <Stack.Screen name="AllStudentsScreen" component={AllStudentsScreen} />
            <Stack.Screen name="AllFacultyScreen" component={AllFacultyScreen} />
            <Stack.Screen name="EditStudentScreen" component={EditStudentScreen} />
            <Stack.Screen name="EditFacultyScreen" component={EditFacultyScreen} />
            <Stack.Screen name="FilteredStudentsScreen" component={FilteredStudentsScreen} />
            <Stack.Screen name="DeletedStudentsScreen" component={DeletedStudentsScreen} />
            <Stack.Screen name="DeletedFacultyScreen" component={DeletedFacultyScreen} />
            <Stack.Screen name="AddEventScreen" component={AddEventScreen} />
            <Stack.Screen name="AddSubjectMasterScreen" component={AddSubjectMasterScreen} />
            <Stack.Screen name="AssignSubjectScreen" component={AssignSubjectScreen} />
            <Stack.Screen name="AdminPosterManager" component={AdminPosterManager} />
            <Stack.Screen name="ClassScheduleScreen" component={ClassScheduleScreen} />
            <Stack.Screen name="ClassScheduleViewScreen" component={ClassScheduleViewScreen} />
            <Stack.Screen name="AddNoticeScreen" component={AddNoticeScreen} />
            <Stack.Screen name="FacultyPerformance" component={FacultyPerformance} />
            <Stack.Screen name="FacultyListScreen" component={FacultyListScreen} />
            <Stack.Screen name="FacultyScore" component={FacultyScoreScreen} />
            <Stack.Screen name="FacultyProfileViewScreen" component={FacultyProfileViewScreen} />
            <Stack.Screen name="AdminStudentProfileView" component={AdminStudentProfileView} />
            <Stack.Screen name="AdminAttendanceScreen" component={AdminAttendanceScreen} />
            <Stack.Screen name="BoardSelectionScreen" component={BoardSelectionScreen} options={{ title: 'Select Board' }} />
            <Stack.Screen name="AdminFeesScreen" component={AdminFeesScreen} />

            <Stack.Screen name="ReportCardLandingScreen" component={ReportCardLandingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ReportCardEditorScreen" component={ReportCardEditorScreen} options={{ headerShown: false }} />


        </Stack.Navigator>

    )
}