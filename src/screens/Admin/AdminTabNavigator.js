import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AdminInsightsScreen from './AdminInsightsScreen';
import AdminWorkbenchScreen from './AdminWorkbenchScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'stats-chart' : 'stats-chart-outline';
                    } else if (route.name === 'Workbench') {
                        iconName = focused ? 'apps' : 'apps-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#ac1d1dff',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={AdminInsightsScreen} />
            <Tab.Screen name="Workbench" component={AdminWorkbenchScreen} />
        </Tab.Navigator>
    );
}
