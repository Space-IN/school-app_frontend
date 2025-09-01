//AppNavigation.js
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Common Screens
import RoleSelection from '../screens/RoleSelection';
import LoginScreen from '../screens/LoginScreen';

// Admin Screens
import AdminDashboard from '../screens/Admin/AdminDashboard';
import AddStudentScreen from '../screens/Admin/AddStudentScreen';
import AddFacultyScreen from '../screens/Admin/AddFacultyScreen';
import AllStudentsScreen from '../screens/Admin/AllStudentsScreen';
import AllFacultyScreen from '../screens/Admin/AllFacultyScreen';
import EditStudentScreen from '../screens/Admin/EditStudentScreen';
import EditFacultyScreen from '../screens/Admin/EditFacultyScreen';
import FilteredStudentsScreen from '../screens/Admin/FilteredStudentsScreen';
import DeletedStudentsScreen from '../screens/Admin/DeletedStudentsScreen';
import DeletedFacultyScreen from '../screens/Admin/DeletedFacultyScreen';
import AddEventScreen from '../screens/Admin/Eventmanagement/AddEventScreen';
import AddSubjectMasterScreen from '../screens/Admin/subjectManagement/AddSubjectMasterScreen';
import AssignSubjectScreen from '../screens/Admin/subjectManagement/AssignSubjectScreen';
import AdminPosterManager from '../screens/Admin/AdminPosterManager';
import ClassScheduleScreen from '../screens/Admin/classScheduleManagement/ClassScheduleScreen';
import ClassScheduleViewScreen from '../screens/Admin/classScheduleManagement/ClassScheduleViewScreen';
import AddNoticeScreen from '../screens/Admin/AddNoticeScreen'; // ✅ shanks changes: added Add Notice
import FacultyPerformance from "../screens/Admin/FacultyPerformance";
import FacultyListScreen from "../screens/Admin/FacultyListScreen";  
import FacultyScoreScreen from "../screens/Admin/FacultyScoreScreen";

// Faculty Screens
import FacultyTabs from './FacultyTabs';
import FacultyClassDashboard from '../screens/Faculty/classes/FacultyClassDashboard';
import FacultyStudentsScreen from '../screens/Faculty/classes/FacultyStudentsScreen';
import FacultyAttendanceScreen from '../screens/Faculty/classes/FacultyAttendanceScreen';
import FacultyAssignmentsScreen from '../screens/Faculty/classes/FacultyAssignmentsScreen';
import FacultyTestsScreen from '../screens/Faculty/classes/FacultyTestsScreen';
import FacultyPerformanceScreen from '../screens/Faculty/classes/FacultyPerformanceScreen';
import FacultyScheduleScreen from '../screens/Faculty/schedule/FacultyScheduleScreen';
import FacultyProfileScreen from '../screens/Faculty/profile/FacultyProfileScreen';
 
import ManagePerformanceTab from '../screens/Faculty/classes/performance/ManagePerformanceTab';
import ViewPerformanceTab from '../screens/Faculty/classes/performance/ViewPerformanceTab';
import StudentSubjectMarksScreen from '../screens/Faculty/classes/performance/StudentSubjectMarksScreen';
import ManagePerformanceTabs from '../screens/Faculty/classes/performance/ManagePerformanceTabs';

 
import PastAttendanceScreen from '../screens/Faculty/classes/PastAttendanceScreen'; // ✅ shanks changes: added Past Attendance Screen
 

import MonthlySummaryScreen from '../screens/Faculty/classes/MonthlySummaryScreen'; // ✅ shanks changes: added Monthly Summary Screen

// Student/Parent Screens
import StudentParentTabs from './StudentParentTabs';
import SubjectDashboard from '../screens/StudentParent/homescreen/SubjectDashboard';
import StudentProfileScreen from '../screens/StudentParent/homescreen/StudentProfileScreen';
import AttendanceStudent from '../screens/StudentParent/menuscreen/AttendanceScreen';
import TimetableScreen from '../screens/StudentParent/menuscreen/TimetableScreen';
import NoticeBoardScreen from '../screens/StudentParent/menuscreen/NoticeBoardScreen';
import ParentProfileScreen from '../screens/StudentParent/menuscreen/ParentProfileScreen';
import AcademicCalendarScreen from '../screens/StudentParent/menuscreen/AcademicCalendarScreen';
import SettingsScreen from '../screens/StudentParent/menuscreen/settings/SettingsScreen';
import ExamDetailScreen from '../screens/StudentParent/menuscreen/ExamDetailScreen';
import FeesScreen from '../screens/StudentParent/menuscreen/settings/FeesScreen';
import ChangePasswordScreen from '../screens/StudentParent/menuscreen/settings/ChangePasswordScreen';
import PrivacyPolicyScreen from '../screens/StudentParent/menuscreen/settings/PrivacyPolicyScreen';
import TermsScreen from '../screens/StudentParent/menuscreen/settings/TermsScreen';
import AboutScreen from '../screens/StudentParent/menuscreen/settings/AboutScreen';
import StudentPerformanceScreen from '../screens/StudentParent/menuscreen/StudentPerformanceScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const alwaysStartAtRoleSelection = async () => {
      try {
        await AsyncStorage.removeItem('userData'); // ✅ shanks changes: Always fresh login
        console.log('🧹 Cleared user session for fresh start');
      } catch (err) {
        console.error('❌ Error clearing AsyncStorage:', err);
      } finally {
        setInitialRoute('RoleSelection');
      }
    };

    alwaysStartAtRoleSelection();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      {/* Common */}
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* Admin */}
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


    
      {/* Faculty */}
      <Stack.Screen name="FacultyTabs" component={FacultyTabs} />
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

 

      <Stack.Screen name="PastAttendanceScreen" component={PastAttendanceScreen} /> 
      <Stack.Screen name="MonthlySummaryScreen" component={MonthlySummaryScreen} />
 
      

      {/* Student/Parent */}
      <Stack.Screen name="StudentParentTabs" component={StudentParentTabs} />
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
  );
}
