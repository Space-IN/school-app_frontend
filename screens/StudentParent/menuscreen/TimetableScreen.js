import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function TimeTableScreen() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        const parsed = stored ? JSON.parse(stored) : null;

        if (!parsed?.userId) {
          Alert.alert('Missing Info', 'User ID not found.');
          return;
        }

        const id = parsed.userId.trim().toLowerCase();
        const apiUrl = `${BASE_URL}/api/class-schedule/student/${id}`;
        console.log('📘 Final API Call:', apiUrl);

        const response = await axios.get(apiUrl);
        setSchedule(response.data);
      } catch (err) {
        console.error('❌ Error fetching schedule:', err.message);
        Alert.alert('Error', 'Could not fetch timetable. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (!schedule) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.noSchedule}>No timetable found for this student.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>
          Weekly Timetable ({schedule.classAssigned} {schedule.section})
        </Text>

        {schedule.weeklySchedule.map((dayObj, index) => (
          <View key={index} style={styles.dayBox}>
            <Text style={styles.dayTitle}>{dayObj.day}</Text>

            {dayObj.periods.map((period, idx) => (
              <View key={idx} style={styles.periodCard}>
                <Text style={styles.subject}>
                  {period.subjectMasterId?.name || 'Free Period'}
                </Text>
                <Text style={styles.faculty}>
                  {period.facultyId || ''}
                </Text>
                {period.timeSlot && (
                  <Text style={styles.timeSlot}>{period.timeSlot}</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef3fb',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  dayBox: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  periodCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  subject: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1e293b',
  },
  faculty: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  timeSlot: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSchedule: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 30,
  },
});
