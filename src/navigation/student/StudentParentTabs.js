import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import StudentParentHome from '../../screens/StudentParent/homescreen/studentHomeScreen';

const Tab = createBottomTabNavigator();

export default function MenuScreen({ navigation, route }) {
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
    { title: 'Parent Profile', screen: 'ParentProfileScreen', icon: 'person-circle-outline' },
    { title: 'Academic Calendar', screen: 'AcademicCalendarScreen', icon: 'calendar-number-outline' },
    { title: 'Settings', screen: 'SettingsScreen', icon: 'settings-outline' },
    { title: 'studentProfile', screen: 'StudentProfileScreen', icon: 'person-outline' },
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
            <Ionicons name={item.icon} size={28} color="#4f46e5" style={{ marginBottom: 8 }} />
            <Text style={styles.menuText} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

function StudentParentTabs({ route }) {
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
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 5 },
        headerShown: true,
        headerBackTitleVisible: false,
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