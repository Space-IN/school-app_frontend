// src/navigation/faculty/FacultyTabs.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import FacultyDashboard from '../../screens/Faculty/homescreen/FacultyDashboard';
import FacultyClassesScreen from '../../screens/Faculty/classes/FacultyClassesScreen';
import FacultyClassDashboard from '../../screens/Faculty/classes/FacultyClassDashboard';
import FacultyScheduleScreen from '../../screens/Faculty/schedule/FacultyScheduleScreen';
import FacultyProfileScreen from '../../screens/Faculty/profile/FacultyProfileScreen';
import ViewPerformanceTab from '../../screens/Faculty/classes/performance/ViewPerformanceTab';
import LectureRecordingScreen from '../../screens/Faculty/classes/LectureRecordingScreen';
import FacultyChaptersScreen from '../../screens/Faculty/classes/FacultyChaptersScreen';
 
import FacultyAssignmentsScreen from '../../screens/Faculty/classes/FacultyAssignmentsScreen';
import FacultyTestsScreen from '../../screens/Faculty/classes/FacultyTestsScreen';
import ManagePerformanceTabs from '../../screens/Faculty/classes/performance/ManagePerformanceTabs';
import StudentSubjectMarksScreen from '../../screens/Faculty/classes/performance/StudentSubjectMarksScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Faculty Menu Screen Component
function FacultyMenuScreen({ navigation }) { // Remove route params
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
    { title: 'Attendance', screen: 'FacultyMarkAttendanceScreen', icon: 'checkmark-done-circle' },
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
            onPress={() => navigation.navigate(item.screen)} // Remove params
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

// ClassesStack - Remove route params
function ClassesStack() {
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
        options={{ title: 'Classes' }}
      />
      {/* 
      
      
      
      
      
      
      
      
      */}
      {/* <Stack.Screen
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
      /> */}
      {/* <Stack.Screen
        name="LectureRecordingScreen"
        component={LectureRecordingScreen}
        options={{ title: 'Lecture Recording' }}
      /> */}
      {/* <Stack.Screen 
        name="FacultyChaptersScreen" 
        component={FacultyChaptersScreen} 
        options={{ title: 'Chapters' }}
      /> */}
    </Stack.Navigator>
  );
}

// Updated FacultyTabs - Remove all route param logic
export default function FacultyTabs() {
  return (
     
     <SafeAreaProvider>  

    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#c01e12ff',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        headerBackTitleVisible: false,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            FacultyHome: 'home',
            FacultyScheduleScreen: 'calendar-sharp',
            FacultyMenu: 'grid',
            ClassesStack: 'book',
            FacultyProfile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        // Dynamically hide bottom tabs for specific screens
          tabBarStyle: ((route) => {
            if (route.name === 'ClassesStack') {
              const routeName = getFocusedRouteNameFromRoute(route) ?? '';
              const hideTabScreens = [
                'FacultyPerformanceScreen',
                'StudentSubjectMarksScreen',
                'ViewPerformanceTab',
                'ManagePerformanceTab'
              ];
              
              if (hideTabScreens.includes(routeName)) {
                return { display: 'none' };
              }
            }
            return {
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            };
          })(route),















      })}
    >
      <Tab.Screen 
        name="FacultyHome" 
        component={FacultyDashboard} 
        options={{ tabBarLabel: 'Home' }}
      />
      
      <Tab.Screen 
        name="FacultyScheduleScreen" 
        component={FacultyScheduleScreen} 
        options={{ tabBarLabel: 'Schedule' }}
      />

      <Tab.Screen 
        name="ClassesStack" 
        component={ClassesStack} 
        options={{ tabBarLabel: 'Classes' }}
      />
      
      <Tab.Screen 
        name="FacultyProfile" 
        component={FacultyProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>

     </SafeAreaProvider>
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