import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FacultyAttendanceScreen({ route }) {
  const { grade, section, subjectMasterId, facultyId } = route.params;
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState(null);

  const navigation = useNavigation();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      const { data } = await axios.get(
        `${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`
      );
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
      return Alert.alert(
        'Error',
        'No subject assigned to you today for this class/section.'
      );
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
        status: attendance[s._id] ?? 'Absent',
      })),
    };

    try {
      await axios.post(`${BASE_URL}/api/attendance/mark`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const presentCount = payload.attendanceList.filter(
        entry => entry.status === 'Present'
      ).length;
      const totalCount = payload.attendanceList.length;
      const absentCount = totalCount - presentCount;

      setSummary({ present: presentCount, absent: absentCount });

      Alert.alert('Success', 'Attendance marked successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      console.error('🔴 Error marking attendance:', msg);
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <ActivityIndicator style={{ flex: 1 }} size="large" color="#4a90e2" />
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
      <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />

      {/* 🟦 Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>📋 Attendance for Today</Text>
        <Text style={styles.dateText}>{today}</Text>
      </View>

      <TextInput
        placeholder="Search students..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredStudents}
        keyExtractor={i => i._id}
        renderItem={({ item }) => {
          const status = attendance[item._id] || 'Absent';
          return (
            <TouchableOpacity
              onPress={() => toggleStatus(item._id)}
              style={[
                styles.card,
                status === 'Present' ? styles.present : styles.absent,
              ]}
            >
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.status}>{status}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>
          {submitting ? 'Submitting...' : 'Submit Attendance'}
        </Text>
      </TouchableOpacity>

      {summary && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            🟢 Present: {summary?.present ?? 0} | 🔴 Absent:{' '}
            {summary?.absent ?? 0}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  header: {
    paddingVertical: 5,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  dateText: {
    fontSize: 14,
    color: '#e0e0ff',
    marginTop: 4,
  },
  searchBar: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  present: {
    borderLeftWidth: 6,
    borderLeftColor: '#4caf50',
  },
  absent: {
    borderLeftWidth: 6,
    borderLeftColor: '#f44336',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    fontSize: 14,
    marginTop: 5,
    color: '#555',
  },
  submitButton: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#eef6ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
