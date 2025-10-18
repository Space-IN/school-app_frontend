import React, { useRef, useEffect } from 'react';
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
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="#1e3a8a" />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#1e3a8a" />
          </TouchableOpacity>
        )}
      />
    </View>
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
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e3a8a',
    flex: 1,
    textAlign: 'left',
  },
});
