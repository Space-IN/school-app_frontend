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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ClassesStack({ route }) {
  const { grades, userId, openGrade, redirectedFromHome } = route.params || {};

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FacultyClassesScreen"
        component={FacultyClassesScreen}
        initialParams={{ grades, userId, openGrade, redirectedFromHome }}
        options={{ title: 'My Assigned Classes' }}
      />
      <Stack.Screen name="FacultyClassDashboard" component={FacultyClassDashboard} />
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

  if (!userData) return null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4b4bfa',
        tabBarInactiveTintColor: '#888',
        headerShown: route.name === 'FacultyHomeScreen',
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
