import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import ManagePerformanceTab from './ManagePerformanceTab';
import ViewPerformanceTab from './ViewPerformanceTab';

const Tab = createMaterialTopTabNavigator();

export default function ManagePerformanceTabs({ route }) {
  const { grade, section, student } = route.params; 
  const studentId = student?.userId || null;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
      }}
    >
      <Tab.Screen
        name="ManagePerformanceTab"
        component={ManagePerformanceTab}
        initialParams={{ grade, section }}
        options={{ title: 'Manage Performance' }}
      />
      <Tab.Screen
        name="ViewPerformanceTab"
        component={ViewPerformanceTab}
        initialParams={{ 
          studentId,
          classAssigned: grade, 
          section 
        }}
        options={{ title: 'View Performance' }}
      />
    </Tab.Navigator>
  );
}
