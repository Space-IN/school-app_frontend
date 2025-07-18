// screens/Faculty/schedule/FacultySchedulesScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FacultySchedulesScreen() {
  const [schedule, setSchedule] = useState([]);
  const [facultyName, setFacultyName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultySchedule();
  }, []);

  const fetchFacultySchedule = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const parsed = userData ? JSON.parse(userData) : null;

      if (!parsed?.userId) {
        Alert.alert('Error', 'Faculty ID not found');
        return;
      }

      const res = await axios.get(`${BASE_URL}/api/schedule/faculty/${parsed.userId}`);
      setFacultyName(res.data.facultyName);
      setSchedule(res.data.schedule || []);
    } catch (err) {
      console.error('❌ Error fetching faculty schedule:', err.message);
      Alert.alert('Error', err.response?.data?.message || 'Could not fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const groupScheduleByDay = (scheduleArray) => {
    const grouped = {};
    scheduleArray.forEach(({ day, periods, classAssigned, section }) => {
      if (!grouped[day]) grouped[day] = [];
      periods.forEach((p) =>
        grouped[day].push({
          ...p,
          classAssigned,
          section,
        })
      );
    });
    return grouped;
  };

  const groupedSchedule = groupScheduleByDay(schedule);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📘 {facultyName}'s Schedule</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1d4ed8" />
      ) : Object.keys(groupedSchedule).length === 0 ? (
        <Text style={styles.infoText}>📭 No schedule found.</Text>
      ) : (
        <ScrollView style={styles.scrollSection}>
          {Object.entries(groupedSchedule).map(([day, periods], index) => (
            <View key={index} style={styles.dayBlock}>
              <Text style={styles.dayTitle}>{day}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.cell, styles.headerCell, styles.col1]}>#</Text>
                    <Text style={[styles.cell, styles.headerCell, styles.col2]}>Time</Text>
                    <Text style={[styles.cell, styles.headerCell, styles.col3]}>Subject</Text>
                    <Text style={[styles.cell, styles.headerCell, styles.col4]}>Class</Text>
                    <Text style={[styles.cell, styles.headerCell, styles.col5]}>Section</Text>
                  </View>

                  {periods.map((p, i) => (
                    <View key={i} style={styles.tableRow}>
                      <Text style={[styles.cell, styles.col1]}>{p.periodNumber}</Text>
                      <Text style={[styles.cell, styles.col2]}>{p.timeSlot}</Text>
                      <Text style={[styles.cell, styles.col3]}>
                        {p.subjectMasterId?.name || 'N/A'}
                      </Text>
                      <Text style={[styles.cell, styles.col4]}>{p.classAssigned}</Text>
                      <Text style={[styles.cell, styles.col5]}>{p.section}</Text>
                    </View>

                    
                  ))}
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    color: '#1e3a8a',
    textAlign: 'center',
  },
  scrollSection: {
    paddingBottom: 40,
  },
  infoText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6b7280',
  },
  dayBlock: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    overflow: 'hidden',
    elevation: 2,
  },
  dayTitle: {
    backgroundColor: '#e0f2fe',
    fontWeight: 'bold',
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#1e40af',
    borderBottomWidth: 1,
    borderColor: '#cbd5e1',
  },
  table: {
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  headerCell: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  col1: { width: 50 },
  col2: { width: 100 },
  col3: { width: 160 },
  col4: { width: 100 },
  col5: { width: 100 },
});
