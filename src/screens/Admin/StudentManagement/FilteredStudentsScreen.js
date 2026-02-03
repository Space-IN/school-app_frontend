import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../../../api/api';

export default function FilteredStudentsScreen({ route, navigation }) {
  const { grade, section, board } = route.params;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFilteredStudents();
    });

    fetchFilteredStudents();
    return unsubscribe;
  }, [navigation]);

  const fetchFilteredStudents = async () => {
    try {
      setLoading(true);
      setError('');

      if (!grade || !section) {
        setError('Grade and section are required');
        setStudents([]);
        return;
      }

      const className = (grade || '').replace('Grade ', '').trim();
      const encodedGrade = encodeURIComponent(className);
      const encodedSection = encodeURIComponent(section);
      const boardQuery = board ? `?board=${encodeURIComponent(board)}` : '';

      const res = await api.get(
        `/api/admin/students/grade/${encodedGrade}/section/${encodedSection}${boardQuery}`
      );

      let fetchedStudents = Array.isArray(res.data) ? res.data : [];

      fetchedStudents = fetchedStudents.filter(
        (s) => !s.isDeleted && !s.deletedAt
      );

      if (board) {
        fetchedStudents = fetchedStudents.filter(
          (s) => s.board === board
        );
      }

      setStudents(fetchedStudents);
    } catch (err) {
      if (err.response?.status === 404) {
        setStudents([]);
        setError('');
      } else {
        console.error('❌ Error fetching filtered students:', err);
        setError('Failed to load students. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    navigation.navigate('EditStudentScreen', { student });
  };

  const handleSoftDelete = async (userId) => {
    try {
      await api.patch(`/api/admin/students/delete/${userId}`);
      Alert.alert('Deleted', 'Student soft deleted.');
      fetchFilteredStudents();
    } catch (err) {
      console.error('❌ Soft delete failed:', err);
    }
  };

  const handleViewProfile = (student) => {
    navigation.navigate('AdminStudentProfileView', { student });
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
        {item.board && (
          <Text style={styles.details}>Board: {item.board}</Text>
        )}
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
        Students of Grade {(grade || '').replace('Grade ', '')} - Section {section || ''} {board ? `(${board})` : ''}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#19191b" style={{ marginTop: 20 }} />
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
  container: { flex: 1, backgroundColor: '#ffffff' },
  topPadding: { height: 10 },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#070707',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: '#fecaca',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { fontWeight: 'bold', fontSize: 16, color: '#0c0c0c' },
  details: { fontSize: 14, marginTop: 4, color: '#555' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 15 },
  editBtn: { color: '#007bff', fontSize: 16 },
  softDeleteBtn: { color: '#f59e0b', fontSize: 16 },
  noData: { padding: 20, textAlign: 'center', color: '#666' },
  errorText: { padding: 20, color: 'red', textAlign: 'center' },
});