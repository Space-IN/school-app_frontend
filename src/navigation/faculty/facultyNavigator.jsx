// // src/navigation/faculty/facultyNavigator.jsx

// import { createNativeStackNavigator } from "@react-navigation/native-stack"

// import FacultyTabs from './FacultyTabs';
// import FacultyClassDashboard from '../../screens/Faculty/classes/FacultyClassDashboard';
// import FacultyStudentsScreen from '../../screens/Faculty/classes/FacultyStudentsScreen';
// import FacultyAttendanceScreen from '../../screens/Faculty/classes/FacultyAttendanceScreen';
// import FacultyAssignmentsScreen from '../../screens/Faculty/classes/FacultyAssignmentsScreen';
// import FacultyTestsScreen from '../../screens/Faculty/classes/FacultyTestsScreen';
// import ManagePerformanceTabs from "../../screens/Faculty/classes/performance/ManagePerformanceTabs";
// import FacultyScheduleScreen from '../../screens/Faculty/schedule/FacultyScheduleScreen';
// import FacultyProfileScreen from '../../screens/Faculty/profile/FacultyProfileScreen';
// import ManagePerformanceTab from "../../screens/Faculty/classes/performance/ManagePerformanceTab";
// import ViewPerformanceTab from "../../screens/Faculty/classes/performance/ViewPerformanceTab";
// import StudentSubjectMarksScreen from "../../screens/Faculty/classes/performance/StudentSubjectMarksScreen";
// import FacultyDashboard from "../../screens/Faculty/homescreen/FacultyDashboard";

// const Stack = createNativeStackNavigator()

// export default function FacultyNavigator() {

//     return (
//         <Stack.Navigator
//             initialRouteName="FacultyTabs"
//             screenOptions={{
//                 headerShown: true,
//                 headerBackTitleVisible: false,
//             }}
//         >
//             <Stack.Screen name="FacultyTabs" component={FacultyTabs} options={{ headerShown: false }} />
//             <Stack.Screen name="FacultyClassDashboard" component={FacultyClassDashboard} />
//             <Stack.Screen name="FacultyStudentsScreen" component={FacultyStudentsScreen} />
//             <Stack.Screen name="FacultyAttendanceScreen" component={FacultyAttendanceScreen} />
//             <Stack.Screen name="FacultyAssignmentsScreen" component={FacultyAssignmentsScreen} />
//             <Stack.Screen name="FacultyTestsScreen" component={FacultyTestsScreen} />
//             <Stack.Screen name="FacultyPerformanceScreen" component={ManagePerformanceTabs} />
//             <Stack.Screen name="FacultyScheduleScreen" component={FacultyScheduleScreen} />
//             <Stack.Screen name="FacultyProfileScreen" component={FacultyProfileScreen} />
//             <Stack.Screen name="ManagePerformanceTab" component={ManagePerformanceTab} />
//             <Stack.Screen name="ViewPerformanceTab" component={ViewPerformanceTab} />
//             <Stack.Screen name="StudentSubjectMarksScreen" component={StudentSubjectMarksScreen} />

//             <Stack.Screen name="FacultyDashboard" component={FacultyDashboard} />
//         </Stack.Navigator>
//     )
// }


// src/navigation/faculty/facultyNavigator.jsx

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



import LectureRecordingScreen from "../../screens/Faculty/classes/LectureRecordingScreen";
import FacultyChaptersScreen from "../../screens/Faculty/classes/FacultyChaptersScreen";
import StudentProfileScreen from "../../screens/Faculty/classes/StudentProfileScreen"; 





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
            <Stack.Screen 
                name="FacultyTabs" 
                component={FacultyTabs} 
                options={{ headerShown: false }} 
            />
            
            {/* Direct screens that can be accessed from menu */}
            <Stack.Screen 
                name="FacultyScheduleScreen" 
                component={FacultyScheduleScreen} 
                options={{ title: 'Schedule' }}
            />
            <Stack.Screen 
                name="FacultyAttendanceScreen" 
                component={FacultyAttendanceScreen} 
                options={{ title: 'Attendance' }}
            />
            <Stack.Screen 
                name="FacultyAssignmentsScreen" 
                component={FacultyAssignmentsScreen} 
                options={{ title: 'Assignments' }}
            />
            <Stack.Screen 
                name="FacultyTestsScreen" 
                component={FacultyTestsScreen} 
                options={{ title: 'Tests' }}
            />
            <Stack.Screen 
                name="FacultyPerformanceScreen" 
                component={ManagePerformanceTabs} 
                options={{ title: 'Performance' }}
            />
            <Stack.Screen 
                name="LectureRecordingScreen" 
                component={LectureRecordingScreen} 
                options={{ title: 'Lecture Recording' }}
            />
            <Stack.Screen 
                name="FacultyChaptersScreen" 
                component={FacultyChaptersScreen} 
                options={{ title: 'Chapters' }}
            />
            
            {/* Additional screens that might be needed */}
            <Stack.Screen 
                name="FacultyClassDashboard" 
                component={FacultyClassDashboard} 
                options={{ title: 'Class Dashboard' }}
            />
            <Stack.Screen 
                name="FacultyStudentsScreen" 
                component={FacultyStudentsScreen} 
                options={{ title: 'Students' }}
            />


            <Stack.Screen 
                name="FacultyProfileScreen" 
                component={FacultyProfileScreen} 
                options={{ title: 'Profile' }}
            />
            

            <Stack.Screen 
                name="ManagePerformanceTab" 
                component={ManagePerformanceTab} 
                options={{ title: 'Manage Performance' }}
            />
            <Stack.Screen 
                name="ViewPerformanceTab" 
                component={ViewPerformanceTab} 
                options={{ title: 'View Performance' }}
            />
            <Stack.Screen 
                name="StudentSubjectMarksScreen" 
                component={StudentSubjectMarksScreen} 
                options={{ title: 'Student Marks' }}
            />

            

              <Stack.Screen 
                name="StudentProfileScreen" 
                component={StudentProfileScreen} 
                options={{ title: 'Student Profile' }}
            />


        </Stack.Navigator>
    )
}