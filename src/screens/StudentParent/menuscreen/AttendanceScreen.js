import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config/baseURL';

const AttendanceScreen = () => {
  const [groupedAttendance, setGroupedAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        const parsed = JSON.parse(stored);
        const studentUserId = parsed?.userId;

        if (!studentUserId) {
          Alert.alert('Error', 'Student user ID is missing.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/attendance/student/${studentUserId}`);
        const data = await res.json();

        console.log('📦 Attendance response:', data);

        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data);
          Alert.alert('Error', data.message || 'Could not fetch attendance.');
          return;
        }

        const grouped = groupByDate(data);
        setGroupedAttendance(grouped);
      } catch (error) {
        console.error('❌ Error fetching attendance:', error);
        Alert.alert('Error', 'Something went wrong while fetching attendance.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const groupByDate = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const dateKey = new Date(item.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    return Object.keys(grouped).map((date) => ({
      date,
      records: grouped[date],
    }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.dateLabel}>📅 {item.date}</Text>
      {item.records.map((record, index) => (
        <View key={index} style={styles.subjectBox}>
          <Text style={styles.subject}>📘 {record.subject}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: record.status === 'Present' ? '#4CAF50' : '#F44336' },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: record.status === 'Present' ? '#2e7d32' : '#c62828' },
              ]}
            >
              {record.status}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Attendance Summary</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#4b4bfa" />
      ) : (
        <FlatList
          data={groupedAttendance}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.noData}>⚠️ No attendance records found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
    
  },
  header: {
    padding: 16,
    backgroundColor: '#4a90e2',
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  subjectBox: {
    marginBottom: 10,
  },
  subject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  noData: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default AttendanceScreen;
