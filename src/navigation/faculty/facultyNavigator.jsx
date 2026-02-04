// src/navigation/faculty/facultyNavigator.jsx

import { createNativeStackNavigator } from "@react-navigation/native-stack"
import FacultyTabs from './FacultyTabs';

import FacultyLayout  from "./FacultyLayout"; //new import

import FacultyClassDashboard from '../../screens/Faculty/classes/FacultyClassDashboard';
import FacultyStudentsScreen from '../../screens/Faculty/classes/FacultyStudentsScreen';


import FacultyAttendanceMenuScreen from "../../screens/Faculty/classes/Attendance/FacultyAttendanceMenuScreen";
 
import FacultyEditAttendanceScreen from '../../screens/Faculty/classes/Attendance/FacultyEditAttendanceScreen';
import FacultyMarkSession1Screen from "../../screens/Faculty/classes/Attendance/FacultyMarkSession1Screen";
import FacultyMarkSession2Screen from "../../screens/Faculty/classes/Attendance/FacultyMarkSession2Screen";




import FacultyAssignmentsScreen from '../../screens/Faculty/classes/FacultyAssignmentsScreen';
import FacultyTestsScreen from '../../screens/Faculty/classes/FacultyTestsScreen';


import ManagePerformanceTabs from "../../screens/Faculty/classes/performance/ManagePerformanceTabs";


import ClassScheduleScreen from "../../screens/Faculty/schedule/ClassScheduleScreen";
import FacultyScheduleScreen from '../../screens/Faculty/schedule/FacultyScheduleScreen';


import FacultyProfileScreen from '../../screens/Faculty/profile/FacultyProfileScreen';


import ManagePerformanceTab from "../../screens/Faculty/classes/performance/ManagePerformanceTab";
import ViewPerformanceTab from "../../screens/Faculty/classes/performance/ViewPerformanceTab";
import StudentSubjectMarksScreen from "../../screens/Faculty/classes/performance/StudentSubjectMarksScreen";



import LectureRecordingScreen from "../../screens/Faculty/classes/LectureRecordingScreen";
import PastRecordingsScreen from "../../screens/Faculty/classes/PastRecordingsScreen";


import FacultyChaptersScreen from "../../screens/Faculty/classes/FacultyChaptersScreen"; 



import { SafeAreaProvider } from "react-native-safe-area-context";  //new import


const Stack = createNativeStackNavigator()

export default function FacultyNavigator() {
    return (
         
         <SafeAreaProvider>

        <Stack.Navigator
            initialRouteName="FacultyLayout"
            screenOptions={{
                headerShown: false, //hide the stack headers since we have our own header in FacultyLayout
                headerBackTitleVisible: false,
            }}
        >
              
               {/* Main faculty interface with header + tabs */}
            <Stack.Screen 
                name="FacultyLayout" 
                component={FacultyLayout} 
            />     



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
                name="ClassScheduleScreen" 
                component={ClassScheduleScreen} 
                options={{ title: 'Schedule' }}
            />

            


            {/* <Stack.Screen 
                name="FacultyMarkAttendanceScreen" 
                component={FacultyMarkAttendanceScreen} 
                options={{ title: 'Attendance' }}
            /> */}


              <Stack.Screen 
                name="FacultyAttendanceMenuScreen" 
                component={FacultyAttendanceMenuScreen} 
                options={{ title: 'Attendance' }}
            />


            <Stack.Screen name="FacultyEditAttendanceScreen"
            component={FacultyEditAttendanceScreen}/>


             {/* <Stack.Screen name="FacultyMarkAttendanceScreen"
            component={FacultyMarkAttendanceScreen}/> */}
            
             <Stack.Screen name="FacultyMarkSession1Screen"
            component={FacultyMarkSession1Screen}/>

            <Stack.Screen name="FacultyMarkSession2Screen"
            component={FacultyMarkSession2Screen}/>


                



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
  name="PastRecordingsScreen" 
  component={PastRecordingsScreen}
  options={{
    title: 'Past Recordings',
    headerStyle: { backgroundColor: '#c01e12ff' },
    headerTintColor: '#fff',
  }}
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


        </Stack.Navigator>
        </SafeAreaProvider>
    )
}