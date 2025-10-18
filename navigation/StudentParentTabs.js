import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StudentParentHome from '../screens/StudentParent/homescreen/StudentParentHome';

const Tab = createBottomTabNavigator();

function MenuScreen({ navigation, route }) {
  const { userId, userData } = route?.params || {};
  const flatListRef = useRef(null);

  useEffect(() => {
    console.log('📦 MenuScreen route params:', route?.params);
    if (!userId) {
      console.warn('⚠️ No userId found in MenuScreen params');
    }

    const unsubscribe = navigation.addListener('tabPress', () => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    });

    return unsubscribe;
  }, [navigation]);

  const menuItems = [
    { title: 'Attendance', screen: 'AttendanceScreen', icon: 'checkmark-done-circle' },
    { title: 'Timetable', screen: 'TimetableScreen', icon: 'calendar-outline' },
    { title: 'Notice Board', screen: 'NoticeBoardScreen', icon: 'megaphone-outline' },
    { title: 'Performance', screen: 'StudentPerformanceScreen', icon: 'stats-chart-outline' },
    { title: 'Fees', screen: 'FeesScreen', icon: 'card-outline' },
    { title: 'Parent Profile', screen: 'ParentProfileScreen', icon: 'person-circle-outline' },
    { title: 'Academic Calendar', screen: 'AcademicCalendarScreen', icon: 'calendar-number-outline' },
    { title: 'Settings', screen: 'SettingsScreen', icon: 'settings-outline' },
    { title: 'Student Profile', screen: 'StudentProfileScreen', icon: 'person-outline' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={menuItems}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              navigation.navigate(item.screen, {
                userId,
                userData,
              })
            }
          >
            <View style={styles.menuContent}>
              <Ionicons name={item.icon} size={24} color="#1e3a8a" />
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#1e3a8a" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default function StudentParentTabs({ route }) {
  const params = route?.params || {};
  const userId = params?.userId;
  const userData = params?.userData || params;

  useEffect(() => {
    console.log('📦 Received route params in StudentParentTabs:', params);
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Menu') iconName = 'grid-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          height: 60,
          paddingBottom: 5,
          backgroundColor: '#ffffff'
        },
        headerShown: true,
        headerBackVisible: true,
        headerTitleStyle: {
          color: '#1e3a8a',
          fontSize: 20,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        headerTintColor: '#1e3a8a',
      })}
    >
      <Tab.Screen
        name="Home"
        component={StudentParentHome}
        initialParams={{ userId, userData }}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'Student/Parent Dashboard',
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        initialParams={{ userId, userData }}
        options={{ headerTitle: 'Menu' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  list: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a',
    marginLeft: 16,
  },
});