// navigation/FacultyTabs.js
import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import FacultyDashboard from '../screens/Faculty/homescreen/FacultyDashboard';
import FacultyClassesScreen from '../screens/Faculty/classes/FacultyClassesScreen';
import FacultyClassDashboard from '../screens/Faculty/classes/FacultyClassDashboard';
import FacultyScheduleScreen from '../screens/Faculty/schedule/FacultyScheduleScreen';
import FacultyProfileScreen from '../screens/Faculty/profile/FacultyProfileScreen';
import ViewPerformanceTab from '../screens/Faculty/classes/performance/ViewPerformanceTab';
import LectureRecordingScreen from '../screens/Faculty/classes/LectureRecordingScreen';
import FacultyChaptersScreen from '../screens/Faculty/classes/FacultyChaptersScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
        component={require('../screens/Faculty/classes/FacultyPerformanceScreen').default}
        options={{ title: 'Performance' }}
      />
      <Stack.Screen
        name="StudentSubjectMarksScreen"
        component={require('../screens/Faculty/classes/performance/StudentSubjectMarksScreen').default}
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
            FacultyHomeScreen: 'home',
            Classes: 'book',
            Schedule: 'calendar',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="FacultyHomeScreen" component={FacultyDashboard} initialParams={userData} />
      <Tab.Screen name="Classes" component={ClassesStack} initialParams={userData} />
      <Tab.Screen name="Schedule" component={FacultyScheduleScreen} initialParams={userData} />
      <Tab.Screen name="Profile" component={FacultyProfileScreen} initialParams={userData} />
    </Tab.Navigator>
  );
}
