import { createNativeStackNavigator } from "@react-navigation/native-stack"

import AdminDashboard from '../../screens/Admin/AdminDashboard';
import AddStudentScreen from '../../screens/Admin/AddStudentScreen';
import AddFacultyScreen from '../../screens/Admin/AddFacultyScreen';
import AllStudentsScreen from '../../screens/Admin/AllStudentsScreen';
import AllFacultyScreen from '../../screens/Admin/AllFacultyScreen';
import EditStudentScreen from '../../screens/Admin/EditStudentScreen';
import EditFacultyScreen from '../../screens/Admin/EditFacultyScreen';
import FilteredStudentsScreen from '../../screens/Admin/FilteredStudentsScreen';
import DeletedStudentsScreen from '../../screens/Admin/DeletedStudentsScreen';
import DeletedFacultyScreen from '../../screens/Admin/DeletedFacultyScreen';
import AddEventScreen from '../../screens/Admin/Eventmanagement/AddEventScreen';
import AddSubjectMasterScreen from '../../screens/Admin/subjectManagement/AddSubjectMasterScreen';
import AssignSubjectScreen from '../../screens/Admin/subjectManagement/AssignSubjectScreen';
import AdminPosterManager from '../../screens/Admin/AdminPosterManager';
import ClassScheduleScreen from '../../screens/Admin/classScheduleManagement/ClassScheduleScreen';
import ClassScheduleViewScreen from '../../screens/Admin/classScheduleManagement/ClassScheduleViewScreen';
import AddNoticeScreen from '../../screens/Admin/AddNoticeScreen';
import FacultyPerformance from "../../screens/Admin/FacultyPerformance";
import FacultyListScreen from "../../screens/Admin/FacultyListScreen";  
import FacultyScoreScreen from "../../screens/Admin/FacultyScoreScreen";
import FacultyProfileViewScreen from '../../screens/Admin/FacultyProfileViewScreen';
import AdminAttendanceScreen from '../../screens/Admin/AdminAttendanceScreen';

// import AdminPosterManager from "../../screens/Admin/AdminPosterManager";

import AdminStudentProfileView from "../../screens/Admin/AdminStudentProfileView";

import { StatusBar } from "react-native";
import { SafeAreaFrameContext } from "react-native-safe-area-context";



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
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
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
           <Stack.Screen name="AdminStudentProfileView" component={AdminStudentProfileView}  />
           <Stack.Screen name="AdminAttendanceScreen" component={AdminAttendanceScreen} />
           
           
        </Stack.Navigator>
        
    )
}