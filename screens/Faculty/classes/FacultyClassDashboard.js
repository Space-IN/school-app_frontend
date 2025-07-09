import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function FacultyClassDashboard({ navigation, route }) {
  const { grade, redirectedFromHome } = route.params || {};

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (redirectedFromHome) {
          navigation.navigate('FacultyTabs', {
            screen: 'Home',
            params: { userId: route.params?.userId, grades: [grade] }, // optional
          });
          return true;
        }
        navigation.goBack(); // fallback
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [redirectedFromHome])
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${grade} Dashboard` });
  }, [navigation, grade]);

  const sections = [
    { title: 'Students', icon: 'people', screen: 'FacultyStudentsScreen' },
    { title: 'Attendance', icon: 'clipboard', screen: 'FacultyAttendanceScreen' },
    { title: 'Assignments', icon: 'document-text', screen: 'FacultyAssignmentsScreen' },
    { title: 'Tests & Exams', icon: 'school', screen: 'FacultyTestsScreen' },
    { title: 'Performance', icon: 'bar-chart', screen: 'FacultyPerformanceScreen' },
    { title: 'My Schedule', icon: 'calendar', screen: 'FacultyScheduleScreen' },
  ];

  const handleCardPress = (screen) => {
    navigation.navigate(screen, { grade });
  };

  return (
    <View style={styles.container}>
      {sections.map((section) => (
        <TouchableOpacity
          key={section.title}
          style={styles.card}
          onPress={() => handleCardPress(section.screen)}
        >
          <Ionicons name={section.icon} size={32} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.cardText}>{section.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafe',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#4b4bfa',
    width: '47%',
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});
