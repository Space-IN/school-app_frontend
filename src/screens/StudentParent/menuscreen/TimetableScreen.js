import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config/baseURL';

const { width } = Dimensions.get('window');
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableScreen() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(DAYS[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const debugUserData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const result = await AsyncStorage.multiGet(keys);
      console.log('🔍 All AsyncStorage data:', result);
    } catch (err) {
      console.error('Debug error:', err);
    }
  };

  const fetchSchedule = async () => {
    try {
      setError(null);
      const stored = await AsyncStorage.getItem('userData');
      console.log('📦 Retrieved userData:', stored);
      
      if (!stored) {
        throw new Error('No user data found. Please log in again.');
      }

      const userData = JSON.parse(stored);
      console.log('🔍 Parsed userData:', userData);

      // Check for student ID in different possible locations
      const studentUserId = userData?.userId || userData?.studentId || userData?.id;
      const grade = userData?.classAssigned || userData?.className || userData?.grade;
      const section = userData?.section;

      console.log('📚 Student Info:', { studentUserId, grade, section });

      if (!studentUserId) {
        throw new Error('Student ID not found in user data');
      }

      // First try to get student's personal schedule
      const response = await fetch(
        `${BASE_URL}/api/class-schedule/student/${studentUserId}`
      );
      const data = await response.json();

      console.log('📊 Schedule response:', data);

      if (!response.ok || data.error) {
        console.log('⚠️ Failed to get student schedule, trying class schedule...');
        // If student schedule fails, try getting class schedule
        if (grade && section) {
          const classResponse = await fetch(
            `${BASE_URL}/api/class-schedule/class/${encodeURIComponent(grade)}/section/${encodeURIComponent(section)}`
          );
          const classData = await classResponse.json();
          console.log('📊 Class schedule response:', classData);
          
          if (!classResponse.ok || classData.error) {
            throw new Error(classData.message || 'Failed to fetch class schedule');
          }
          setSchedule(classData);
        } else {
          throw new Error('Class and section information not found');
        }
      } else {
        setSchedule(data);
      }
    } catch (err) {
      console.error('❌ Error fetching schedule:', err.message);
      setError(err.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debugUserData(); // Debug AsyncStorage data
    fetchSchedule();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSchedule().finally(() => setRefreshing(false));
  }, []);

  const renderTimeSlot = (period) => {
    if (!period) return null;

    return (
      <View style={styles.periodCard}>
        <View style={styles.periodHeader}>
          <Text style={styles.periodNumber}>Period {period.periodNumber}</Text>
          <Text style={styles.timeSlot}>{period.timeSlot}</Text>
        </View>
        <View style={styles.periodContent}>
          <View style={styles.subjectContainer}>
            <Ionicons name="book-outline" size={20} color="#1e3a8a" />
            <Text style={styles.subjectText}>
              {period.subjectMasterId?.name || period.subjectName || 'N/A'}
            </Text>
          </View>
          <View style={styles.teacherContainer}>
            <Ionicons name="person-outline" size={20} color="#1e3a8a" />
            <Text style={styles.teacherText}>
              {period.facultyId?.name || period.facultyName || period.facultyId || 'TBD'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const getDaySchedule = () => {
    if (!schedule?.weeklySchedule) return [];
    const daySchedule = schedule.weeklySchedule.find(
      (day) => day.day === selectedDay
    );
    return daySchedule?.periods || [];
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSchedule}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Class Timetable</Text>
        <Text style={styles.subHeaderText}>
          {schedule?.classAssigned} - {schedule?.section}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
      >
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === day && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === day && styles.selectedDayText,
              ]}
            >
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scheduleContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {getDaySchedule().map((period) => (
          <View key={period.periodNumber}>{renderTimeSlot(period)}</View>
        ))}
        {getDaySchedule().length === 0 && (
          <View style={styles.noClassesContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.noClassesText}>No classes scheduled</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bbdbfaff',
  },
  header: {
    backgroundColor: '#1e3a8a',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    marginTop: 4,
  },
  daySelector: {
    flexGrow: 0,
    padding: 16,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedDayButton: {
    backgroundColor: '#1e3a8a',
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  scheduleContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  periodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  periodNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  timeSlot: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  periodContent: {
    gap: 8,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  teacherText: {
    fontSize: 14,
    color: '#64748b',
  },
  noClassesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  noClassesText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
