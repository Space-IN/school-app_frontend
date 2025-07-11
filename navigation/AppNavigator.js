import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import RoleSelection from '../screens/RoleSelection';
import LoginScreen from '../screens/LoginScreen';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import FacultyTabs from './FacultyTabs';
import StudentParentTabs from './StudentParentTabs';
import AddStudentScreen from '../screens/Admin/AddStudentScreen';
import AddFacultyScreen from '../screens/Admin/AddFacultyScreen';
import AllStudentsScreen from '../screens/Admin/AllStudentsScreen';
import AllFacultyScreen from '../screens/Admin/AllFacultyScreen';
import EditStudentScreen from '../screens/Admin/EditStudentScreen';
import EditFacultyScreen from '../screens/Admin/EditFacultyScreen';
import FilteredStudentsScreen from '../screens/Admin/FilteredStudentsScreen';
import DeletedStudentsScreen from '../screens/Admin/DeletedStudentsScreen';
import DeletedFacultyScreen from '../screens/Admin/DeletedFacultyScreen'; 
import AddSubjectScreen from '../screens/Admin/AddSubjectScreen'; 
import AdminPosterManager from '../screens/Admin/AdminPosterManager';





// Student/Parent Sub Screens
import SubjectDashboard from '../screens/StudentParent/homescreen/SubjectDashboard';
import StudentProfileScreen from '../screens/StudentParent/homescreen/StudentProfileScreen';
import AttendanceStudent from '../screens/StudentParent/menuscreen/AttendanceScreen';
import TimetableScreen from '../screens/StudentParent/menuscreen/TimetableScreen';
import NoticeBoardScreen from '../screens/StudentParent/menuscreen/NoticeBoardScreen';
import ExamsScreen from '../screens/StudentParent/menuscreen/ExamsScreen';
import ResultsScreen from '../screens/StudentParent/menuscreen/ResultsScreen';
import ReportScreen from '../screens/StudentParent/menuscreen/ReportScreen';
import ParentProfileScreen from '../screens/StudentParent/menuscreen/ParentProfileScreen';
import AcademicCalendarScreen from '../screens/StudentParent/menuscreen/AcademicCalendarScreen';
import SettingsScreen from '../screens/StudentParent/menuscreen/settings/SettingsScreen';
import ExamDetailScreen from '../screens/StudentParent/menuscreen/ExamDetailScreen';
import FeesScreen from '../screens/StudentParent/menuscreen/settings/FeesScreen';
import ChangePasswordScreen from '../screens/StudentParent/menuscreen/settings/ChangePasswordScreen';
import PrivacyPolicyScreen from '../screens/StudentParent/menuscreen/settings/PrivacyPolicyScreen';
import TermsScreen from '../screens/StudentParent/menuscreen/settings/TermsScreen';
import AboutScreen from '../screens/StudentParent/menuscreen/settings/AboutScreen';

// Faculty
import FacultyClassDashboard from '../screens/Faculty/classes/FacultyClassDashboard';
import FacultyStudentsScreen from '../screens/Faculty/classes/FacultyStudentsScreen';
import FacultyAttendanceScreen from '../screens/Faculty/classes/FacultyAttendanceScreen';
import FacultyAssignmentsScreen from '../screens/Faculty/classes/FacultyAssignmentsScreen';
import FacultyTestsScreen from '../screens/Faculty/classes/FacultyTestsScreen';
import FacultyPerformanceScreen from '../screens/Faculty/classes/FacultyPerformanceScreen';
import FacultyScheduleScreen from '../screens/Faculty/schedule/FacultyScheduleScreen';
import FacultyProfileScreen from '../screens/Faculty/profile/FacultyProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const alwaysStartAtRoleSelection = async () => {
      try {
        await AsyncStorage.removeItem('userData'); // 🔁 Clear saved login every time
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
      <Stack.Screen name="RoleSelection" component={RoleSelection} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="FacultyTabs" component={FacultyTabs} />
      <Stack.Screen name="StudentParentTabs" component={StudentParentTabs} />
      <Stack.Screen name="AddStudentScreen" component={AddStudentScreen} />
      <Stack.Screen name="AddFacultyScreen" component={AddFacultyScreen} options={{ title: 'Add Faculty' }} />
      <Stack.Screen name="AllStudentsScreen" component={AllStudentsScreen} />
      <Stack.Screen name="AllFacultyScreen" component={AllFacultyScreen} />
      <Stack.Screen name="EditStudentScreen" component={EditStudentScreen} />
      <Stack.Screen name="EditFacultyScreen" component={EditFacultyScreen} />
      <Stack.Screen name="FilteredStudentsScreen" component={FilteredStudentsScreen} />
      <Stack.Screen name="DeletedStudentsScreen" component={DeletedStudentsScreen}/>
      <Stack.Screen name="DeletedFacultyScreen" component={DeletedFacultyScreen}/>
      <Stack.Screen name="AddSubjectScreen" component={AddSubjectScreen} />
      <Stack.Screen name="AdminPosterManager" component={AdminPosterManager} />

      




      {/* Student/Parent */}
      <Stack.Screen name="SubjectDashboard" component={SubjectDashboard} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="AttendanceScreen" component={AttendanceStudent} />
      <Stack.Screen name="TimetableScreen" component={TimetableScreen} />
      <Stack.Screen name="NoticeBoardScreen" component={NoticeBoardScreen} />
      <Stack.Screen name="ExamsScreen" component={ExamsScreen} />
      <Stack.Screen name="ResultsScreen" component={ResultsScreen} />
      <Stack.Screen name="ReportScreen" component={ReportScreen} />
      <Stack.Screen name="ParentProfileScreen" component={ParentProfileScreen} />
      <Stack.Screen name="AcademicCalendarScreen" component={AcademicCalendarScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      <Stack.Screen name="FeesScreen" component={FeesScreen} />
      <Stack.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsScreen" component={TermsScreen} />
      <Stack.Screen name="AboutScreen" component={AboutScreen} />

      {/* Faculty */}
      <Stack.Screen name="FacultyClassDashboard" component={FacultyClassDashboard} />
      <Stack.Screen name="FacultyStudentsScreen" component={FacultyStudentsScreen} />
      <Stack.Screen name="FacultyAttendanceScreen" component={FacultyAttendanceScreen} />
      <Stack.Screen name="FacultyAssignmentsScreen" component={FacultyAssignmentsScreen} />
      <Stack.Screen name="FacultyTestsScreen" component={FacultyTestsScreen} />
      <Stack.Screen name="FacultyPerformanceScreen" component={FacultyPerformanceScreen} />
      <Stack.Screen name="FacultyScheduleScreen" component={FacultyScheduleScreen} />
      <Stack.Screen name="FacultyProfileScreen" component={FacultyProfileScreen} />
    </Stack.Navigator>
  );
}
