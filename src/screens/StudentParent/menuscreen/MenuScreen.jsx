import { useRef, } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStudent } from '../../../context/student/studentContext';



const menuItems = [
  { title: 'ATTENDANCE', screen: 'attendanceScreen', icon: 'checkmark-done-circle-sharp' },
  { title: 'TIMETABLE', screen: 'timetableScreen', icon: 'calendar' },
  { title: 'ASSESSMENTS', screen: 'studentPerformanceScreen', icon: 'book-sharp' },
  { title: 'FEES', screen: 'feesScreen', icon: 'card' },
  { title: 'ACADEMIC CALENDAR', screen: 'academicCalendarScreen', icon: 'calendar-clear' },
  { title: 'SETTINGS', screen: 'settingsScreen', icon: 'settings' },
]

export default function MenuScreen({ navigation, route }) {
  const { studentData } = useStudent()
  const flatListRef = useRef(null)

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
                studentData
              })
            }
          >
            <View style={styles.menuContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color="white" />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </View>
            <Ionicons name="caret-forward" size={24} color="black" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 10,
  },
  list: {
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F4F7',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
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
    borderRadius: 15,
    backgroundColor: '#181817b7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
    flex: 1,
    textAlign: 'left',
  },
});
