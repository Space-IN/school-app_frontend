// // navigation/FacultyTabs.js
// import React, { useEffect, useState } from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { Ionicons } from '@expo/vector-icons';

// import FacultyDashboard from '../../screens/Faculty/homescreen/FacultyDashboard';
// import FacultyClassesScreen from '../../screens/Faculty/classes/FacultyClassesScreen';
// import FacultyClassDashboard from '../../screens/Faculty/classes/FacultyClassDashboard';
// import FacultyScheduleScreen from '../../screens/Faculty/schedule/FacultyScheduleScreen';
// import FacultyProfileScreen from '../../screens/Faculty/profile/FacultyProfileScreen';
// import ViewPerformanceTab from '../../screens/Faculty/classes/performance/ViewPerformanceTab';
// import LectureRecordingScreen from '../../screens/Faculty/classes/LectureRecordingScreen';
// import FacultyChaptersScreen from '../../screens/Faculty/classes/FacultyChaptersScreen';

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// function ClassesStack({ route }) {
//   const { grades, userId, openGrade, redirectedFromHome } = route.params || {};

//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//         headerBackTitleVisible: false,
//       }}
//     >
//       <Stack.Screen
//         name="FacultyClassesScreen"
//         component={FacultyClassesScreen}
//         initialParams={{ grades, userId, openGrade, redirectedFromHome }}
//         options={{ title: 'Classes' }}
//       />
//       <Stack.Screen
//         name="FacultyClassDashboard"
//         component={FacultyClassDashboard}
//         options={{ title: 'Class Dashboard' }}
//       />
//       <Stack.Screen
//         name="FacultyPerformanceScreen"
//         component={require('../../screens/Faculty/classes/FacultyPerformanceScreen').default}
//         options={{ title: 'Performance' }}
//       />
//       <Stack.Screen
//         name="StudentSubjectMarksScreen"
//         component={require('../../screens/Faculty/classes/performance/StudentSubjectMarksScreen').default}
//         options={{ title: 'Student Marks' }}
//       />
//       <Stack.Screen
//         name="ViewPerformanceTab"
//         component={ViewPerformanceTab}
//         options={{ title: 'View Performance' }}
//       />
//       <Stack.Screen
//         name="LectureRecordingScreen"
//         component={LectureRecordingScreen}
//         options={{ title: 'Lecture Recording' }}
//       />
//       <Stack.Screen 
//         name="FacultyChaptersScreen" 
//         component={FacultyChaptersScreen} 
//         options={{ title: 'Chapters' }}
//       />
//     </Stack.Navigator>
//   );
// }

// export default function FacultyTabs({ route }) {
//   const [userData, setUserData] = useState(null);

//   useEffect(() => {
//     if (route.params) {
//       setUserData(route.params);
//     }
//   }, [route.params]);

//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         tabBarActiveTintColor: '#4b4bfa',
//         tabBarInactiveTintColor: '#888',
//         headerShown: true,
//         headerBackTitleVisible: false,
//         tabBarIcon: ({ color, size }) => {
//           const icons = {
//             FacultyHomeScreen: 'home',
//             Classes: 'book',
//             Schedule: 'calendar',
//             Profile: 'person',
//           };
//           return <Ionicons name={icons[route.name]} size={size} color={color} />;
//         },
//       })}
//     >
//       <Tab.Screen name="FacultyHomeScreen" component={FacultyDashboard} initialParams={userData} />
//       <Tab.Screen name="Classes" component={ClassesStack} initialParams={userData} />
//       <Tab.Screen name="Schedule" component={FacultyScheduleScreen} initialParams={userData} />
//       <Tab.Screen name="Profile" component={FacultyProfileScreen} initialParams={userData} />
//     </Tab.Navigator>
//   );
// }



// navigation/faculty/FacultyTabs.js
import React, { useEffect, useRef, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import FacultyDashboard from '../../screens/Faculty/homescreen/FacultyDashboard';
import FacultyClassesScreen from '../../screens/Faculty/classes/FacultyClassesScreen';
import FacultyClassDashboard from '../../screens/Faculty/classes/FacultyClassDashboard';
import FacultyScheduleScreen from '../../screens/Faculty/schedule/FacultyScheduleScreen';
import FacultyProfileScreen from '../../screens/Faculty/profile/FacultyProfileScreen';
import ViewPerformanceTab from '../../screens/Faculty/classes/performance/ViewPerformanceTab';
import LectureRecordingScreen from '../../screens/Faculty/classes/LectureRecordingScreen';
import FacultyChaptersScreen from '../../screens/Faculty/classes/FacultyChaptersScreen';
import FacultyAttendanceScreen from '../../screens/Faculty/classes/FacultyAttendanceScreen';
import FacultyAssignmentsScreen from '../../screens/Faculty/classes/FacultyAssignmentsScreen';
import FacultyTestsScreen from '../../screens/Faculty/classes/FacultyTestsScreen';
import ManagePerformanceTabs from '../../screens/Faculty/classes/performance/ManagePerformanceTabs';
import StudentSubjectMarksScreen from '../../screens/Faculty/classes/performance/StudentSubjectMarksScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Faculty Menu Screen Component (New Addition)
function FacultyMenuScreen({ navigation, route }) {
  const { userId, userData } = route?.params || {};
  const flatListRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const menuItems = [
    { title: 'Classes', screen: 'ClassesStack', icon: 'book-outline' },
    { title: 'Schedule', screen: 'FacultyScheduleScreen', icon: 'calendar-outline' },
    { title: 'Attendance', screen: 'FacultyAttendanceScreen', icon: 'checkmark-done-circle' },
    // { title: 'Assignments', screen: 'FacultyAssignmentsScreen', icon: 'document-text-outline' },
    // { title: 'Tests', screen: 'FacultyTestsScreen', icon: 'clipboard-outline' },
    { title: 'Performance', screen: 'FacultyPerformanceScreen', icon: 'stats-chart-outline' },
    { title: 'Lecture Recording', screen: 'LectureRecordingScreen', icon: 'videocam-outline' },
    { title: 'Chapters', screen: 'FacultyChaptersScreen', icon: 'library-outline' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={menuItems}
        keyExtractor={(item) => item.title}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuTile}
            onPress={() =>
              navigation.navigate(item.screen, {
                userId,
                userData,
              })
            }
          >
            <Ionicons name={item.icon} size={28} color="#4b4bfa" style={{ marginBottom: 8 }} />
            <Text style={styles.menuText} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Your existing ClassesStack (keep this as is)
function ClassesStack({ route }) {
  const { grades, userId, openGrade, redirectedFromHome } = route.params || {};

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="FacultyClassesScreen"
        component={FacultyClassesScreen}
        initialParams={{ grades, userId, openGrade, redirectedFromHome }}
        options={{ title: 'Classes' }}
      />
      <Stack.Screen
        name="FacultyClassDashboard"
        component={FacultyClassDashboard}
        options={{ title: 'Class Dashboard' }}
      />
      <Stack.Screen
        name="FacultyPerformanceScreen"
        component={ManagePerformanceTabs}
        options={{ title: 'Performance' }}
      />
      <Stack.Screen
        name="StudentSubjectMarksScreen"
        component={StudentSubjectMarksScreen}
        options={{ title: 'Student Marks' }}
      />
      <Stack.Screen
        name="ViewPerformanceTab"
        component={ViewPerformanceTab}
        options={{ title: 'View Performance' }}
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
    </Stack.Navigator>
  );
}

// Updated FacultyTabs with Menu
export default function FacultyTabs({ route }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (route.params) {
      setUserData(route.params);
    }
  }, [route.params]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4b4bfa',
        tabBarInactiveTintColor: '#888',
        headerShown: true,
        headerBackTitleVisible: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            FacultyHome: 'home',
            FacultyMenu: 'grid',
            ClassesStack: 'book',
            FacultyProfile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="FacultyHome" 
        component={FacultyDashboard} 
        initialParams={userData}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="FacultyMenu" 
        component={FacultyMenuScreen} 
        initialParams={userData}
        options={{ tabBarLabel: 'Menu', headerTitle: 'Faculty Menu' }}
      />
      <Tab.Screen 
        name="ClassesStack" 
        component={ClassesStack} 
        initialParams={userData}
        options={{ tabBarLabel: 'Classes' }}
      />
      <Tab.Screen 
        name="FacultyProfile" 
        component={FacultyProfileScreen} 
        initialParams={userData}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const { width } = Dimensions.get('window');
const tileWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  grid: {
    padding: 10,
    paddingBottom: 30,
  },
  menuTile: {
    width: tileWidth,
    margin: 8,
    paddingVertical: 16,
    paddingHorizontal: 6,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    elevation: 2,
    minHeight: 100,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1e3a8a',
    flexShrink: 1,
    includeFontPadding: false,
  },
});