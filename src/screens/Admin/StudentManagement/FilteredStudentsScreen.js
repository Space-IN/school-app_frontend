

import React, { useEffect, useState } from 'react';
import {
  Platform,
  StatusBar,
  SafeAreaView,
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  
} from 'react-native';
import { BASE_URL } from '@env';
import { api } from '../../../api/api';

export default function FilteredStudentsScreen({ route, navigation }) {
  const { grade, section } = route.params;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Set up a navigation listener to check for refresh triggers
    const unsubscribe = navigation.addListener('focus', () => {
      // Always refresh when screen comes into focus
      fetchFilteredStudents();
    });

    // Initial fetch
    fetchFilteredStudents();

    // Cleanup subscription
    return unsubscribe;
  }, [navigation]);

  const fetchFilteredStudents = async () => {
    try {
      if (!grade || !section) {
        setError('Grade and section are required');
        setLoading(false);
        return;
      }
      const className = (grade || '').replace('Grade ', '').trim();
      const encodedGrade = encodeURIComponent(className);
      const encodedSection = encodeURIComponent(section);

      const res = await api.get(
        `${BASE_URL}/api/admin/students/grade/${encodedGrade}/section/${encodedSection}`
      );
      setStudents(res.data || []);
    } catch (err) {
      console.error('❌ Error fetching filtered students:', err.message);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    navigation.navigate('EditStudentScreen', { 
      student, 
      onGoBack: fetchFilteredStudents 
    });
  };

  const handleSoftDelete = async (userId) => {
    try {
      await api.patch(`${BASE_URL}/api/admin/students/delete/${userId}`);
      Alert.alert('Deleted', 'Student soft deleted.');
      fetchFilteredStudents();
    } catch (err) {
      console.error('❌ Soft delete failed:', err);
    }
  };

  const handleViewProfile = (student) => {
    navigation.navigate('AdminStudentProfileView', { student });
  };

  const handleViewAttendance = () => {
    // Navigate to the new Attendance Screen
    navigation.navigate('AdminAttendanceScreen', { grade, section });
  };

 const renderStudent = ({ item }) => (
  <TouchableOpacity onPress={() => handleViewProfile(item)}>
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.name} ({item.userId})
      </Text>
      <Text style={styles.details}>
        Grade: {item.className} | Section: {item.section}
      </Text>
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Text style={styles.editBtn}>Edit Data</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleSoftDelete(item.userId)}>
          <Text style={styles.softDeleteBtn}>Soft delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topPadding} />
      <Text style={styles.heading}>
        👨‍🎓 Students of Grade {(grade || '').replace('Grade ', '')} - Section {section || ''}
      </Text>

      {/* Button to view attendance */}
      <TouchableOpacity style={styles.attendanceBtn} onPress={handleViewAttendance}>
        <Text style={styles.attendanceText}>📅 View Attendance</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : students.length === 0 ? (
        <Text style={styles.noData}>No students found.</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          renderItem={renderStudent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  topPadding: { height: 10 },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  attendanceBtn: {
    backgroundColor: '#e0f2fe',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  attendanceText: { fontSize: 16, fontWeight: '600', color: '#1e3a8a' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { fontWeight: 'bold', fontSize: 16, color: '#1e3a8a' },
  details: { fontSize: 14, marginTop: 4, color: '#555' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 15 },
  editBtn: { color: '#007bff', fontSize: 16 },
  softDeleteBtn: { color: '#f59e0b', fontSize: 16 },
  viewBtn: { color: '#10b981', fontSize: 16 },
  noData: { padding: 20, textAlign: 'center', color: '#666' },
  errorText: { padding: 20, color: 'red', textAlign: 'center' },
});