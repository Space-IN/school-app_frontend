// FacultyAttendanceScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Text } from 'react-native';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FacultyAttendanceScreen({ route }) {
  const { grade, section, subjectMasterId, facultyId } = route.params;
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`);
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = id =>
    setAttendance(prev => ({
      ...prev,
      [id]: prev[id] === 'Present' ? 'Absent' : 'Present',
    }));

  const handleSubmit = async () => {
    if (!subjectMasterId) {
      return Alert.alert('Error', 'No subject assigned to you today for this class/section.');
    }

    setSubmitting(true);
    const date = new Date().toISOString().split('T')[0];
    const token = await AsyncStorage.getItem('token');

    const payload = {
      classAssigned: grade,
      section,
      subjectMasterId,
      facultyId,
      date,
      attendanceList: students.map(s => ({
        userId: s.userId,
        status: attendance[s._id] || 'Absent',
      })),
    };

    console.log('📦 Submitting Attendance Payload:', payload);

    try {
      await axios.post(`${BASE_URL}/api/attendance/mark`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Attendance marked successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error('🔴 Error marking attendance:', msg);
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4b4bfa" />;

  return (
    <View style={styles.container}>
      {/* 🟦 Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Attendance for Today</Text>
        <Text style={styles.dateText}>{today}</Text>
      </View>

      {/* 🟩 List */}
      <FlatList
        data={students}
        keyExtractor={i => i._id}
        renderItem={({ item }) => {
          const status = attendance[item._id] || 'Absent';
          return (
            <TouchableOpacity
              onPress={() => toggleStatus(item._id)}
              style={[styles.card, status === 'Present' ? styles.present : styles.absent]}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.status}>{status}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* 🟨 Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Attendance'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 26, backgroundColor: '#f6f9ff' },

  header: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#4b4bfa',
    borderRadius: 12,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#e0e0ff',
    marginTop: 4,
  },

  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  present: { backgroundColor: '#d4f8d4' },
  absent: { backgroundColor: '#f8d4d4' },
  name: { fontSize: 18, fontWeight: '600' },
  status: { fontSize: 14, color: '#333', marginTop: 4 },
  submitButton: {
    backgroundColor: '#4b4bfa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { color: '#fff', fontWeight: 'bold' },
});
