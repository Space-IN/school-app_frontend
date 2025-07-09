import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✅ Updated path after moving the file
import StudentParentHome from '../screens/StudentParent/homescreen/StudentParentHome';
import { users } from '../data/mockUsers';
import AssignmentDashboard from '../screens/StudentParent/assignmentscreen/AssignmentDashboard';

const Tab = createBottomTabNavigator();

function ChatScreen() {
  const navigation = useNavigation();

  const facultyList = Object.values(users).filter(user => user.role === 'Faculty');

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={chatStyles.card}
      onPress={() => navigation.navigate('ChatMessage', { faculty: item })}
    >
      <Ionicons name="person-circle-outline" size={36} color="#4f46e5" />
      <View style={{ marginLeft: 10 }}>
        <Text style={chatStyles.name}>{item.name}</Text>
        <Text style={chatStyles.subject}>Subjects: {item.subjects?.join(', ')}</Text>
        {item.classes && (
          <Text style={chatStyles.classes}>Classes: {item.classes.join(', ')}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={chatStyles.container}>
      <Text style={chatStyles.title}>Assigned Faculty List</Text>
      <FlatList
        data={facultyList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

function MenuScreen({ navigation, route }) {
  const { userData } = route.params || {};

  const menuItems = [
    { title: 'Attendance', screen: 'AttendanceScreen', icon: 'checkmark-done-circle' },
    { title: 'Timetable', screen: 'TimetableScreen', icon: 'calendar-outline' },
    { title: 'Notice Board', screen: 'NoticeBoardScreen', icon: 'megaphone-outline' },
    { title: 'Exams', screen: 'ExamsScreen', icon: 'document-text-outline' },
    { title: 'Results', screen: 'ResultsScreen', icon: 'bar-chart-outline' },
    { title: 'Report', screen: 'ReportScreen', icon: 'clipboard-outline' },
    { title: 'Parent Profile', screen: 'ParentProfileScreen', icon: 'person-circle-outline' },
    { title: 'Academic Calendar', screen: 'AcademicCalendarScreen', icon: 'calendar-number-outline' },
    { title: 'Settings', screen: 'SettingsScreen', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.title}
        numColumns={3}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuTile}
            onPress={() => navigation.navigate(item.screen, { userData })}
          >
            <Ionicons name={item.icon} size={32} color="#4f46e5" style={{ marginBottom: 8 }} />
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

export default function StudentParentTabs({ route }) {
  const params = route?.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Chat') iconName = 'chatbubble-ellipses-outline';
          else if (route.name === 'Assignments') iconName = 'document-text-outline';
          else if (route.name === 'Menu') iconName = 'grid-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 5 },
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={StudentParentHome}
        initialParams={params}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'Student/Parent Dashboard',
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerTitle: 'Chat with Faculty',
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentDashboard}
        options={{ headerTitle: 'Assignments' }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        initialParams={params}
        options={{ headerTitle: 'Menu' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  menuTile: {
    flex: 1,
    margin: 10,
    padding: 16,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    elevation: 2,
    minHeight: 100,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1e3a8a',
  },
});

const chatStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4f46e5',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  subject: {
    fontSize: 14,
    color: '#555',
  },
  classes: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
});
