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
      {/* 🟦 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📘 {facultyName}'s Schedule</Text>
      </View>

      {/* Body */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#4b4bfa" style={{ marginTop: 30 }} />
        ) : Object.keys(groupedSchedule).length === 0 ? (
          <Text style={styles.noSchedule}>📭 No schedule found.</Text>
        ) : (
          Object.entries(groupedSchedule).map(([day, periods], index) => (
            <View key={index} style={styles.dayCard}>
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
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 16,
    backgroundColor: '#4b4bfa',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  noSchedule: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#d1d5db',
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
