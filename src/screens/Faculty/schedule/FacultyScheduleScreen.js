import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
 
import { BASE_URL } from '@env';
import { useAuth } from "../../../context/authContext";
import { useScrollToTop } from '@react-navigation/native';
import { api } from '../../../api/api';

export default function FacultySchedulesScreen() {
  const { decodedToken } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [facultyName, setFacultyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  useEffect(() => {
    fetchFacultySchedule();
  }, []);

  const fetchFacultySchedule = async () => {
    try {
      setLoading(true);
      
      const facultyId = decodedToken?.preferred_username;
      
      if (!facultyId) {
        Alert.alert('Error', 'Faculty ID not found');
        return;
      }

      console.log('Fetching schedule for faculty:', facultyId);
      
      const res = await api.get(`${BASE_URL}/api/faculty/schedule/faculty/${facultyId}`);
      console.log('Schedule API response:', res.data);
      
      setFacultyName(res.data.facultyName);
      setSchedule(res.data.schedule || []);
    } catch (err) {
      console.error('❌ Error fetching faculty schedule:', err);
      console.error('Error details:', err.response?.data);
      Alert.alert('Error', err.response?.data?.message || 'Could not fetch schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFacultySchedule();
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
        <Text style={styles.headerTitle}>📘 {facultyName}'s Full Week Schedule</Text>
      </View>

      {/* Body */}
      <ScrollView
        ref={scrollRef}
        style={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                    <Text style={[styles.cell, styles.headerCell, styles.col1]}>P.NO</Text>
                    <Text style={[styles.cell, styles.headerCell, styles.col2]}>Time</Text>
                    <Text style={[styles.cell, styles.headerCell, styles.col3]}>Subject </Text>
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
    backgroundColor: '#ffffffff',
  },
  header: {
    padding: 16,
    backgroundColor: '#c01e12ff',
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
    borderColor: '#9c1006',
  },
  dayTitle: {
    backgroundColor: '#faebebff',
    fontWeight: 'bold',
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#000000ff',
    borderBottomWidth: 1,
    borderColor: '#9c1006',
  },
  table: {
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#9c1006',
  },
  tableRow: {
    flexDirection: 'row',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#9c1006',
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  headerCell: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
    color: '#000000ff',
  },
  col1: { width: 50 },
  col2: { width: 100 },
  col3: { width: 160 },
  col4: { width: 100 },
  col5: { width: 100 },
});

