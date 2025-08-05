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
import axios from 'axios';
import BASE_URL from '../../config/baseURL';

export default function FilteredStudentsScreen({ route, navigation }) {
  const { grade, section } = route.params;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFilteredStudents();
  }, []);

  const fetchFilteredStudents = async () => {
    try {
      const className = grade.replace('Grade ', '').trim();
      const encodedGrade = encodeURIComponent(className);
      const encodedSection = encodeURIComponent(section);

      const res = await axios.get(
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
    navigation.navigate('EditStudentScreen', { student });
  };

  const handleSoftDelete = async (userId) => {
    try {
      await axios.patch(`${BASE_URL}/api/admin/students/delete/${userId}`);
      Alert.alert('Deleted', 'Student soft deleted.');
      fetchFilteredStudents();
    } catch (err) {
      console.error('❌ Soft delete failed:', err);
    }
  };

  const handleViewProfile = (student) => {
    navigation.navigate('StudentProfileScreen', { student });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topPadding} />
      <Text style={styles.heading}>
        👨‍🎓 Students of Grade {grade.replace('Grade ', '')} - Section {section}
      </Text>

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
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleViewProfile(item)} activeOpacity={0.8}>
              <View style={styles.card}>
                <Text style={styles.name}>
                  {item.name} ({item.userId})
                </Text>
                <Text style={styles.details}>
                  Grade: {item.className} | Section: {item.section}
                </Text>

                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => handleEdit(item)}>
                    <Text style={styles.editBtn}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleSoftDelete(item.userId)}>
                    <Text style={styles.softDeleteBtn}>⚠️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topPadding: {
    height: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1e3a8a',
  },
  details: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 15,
  },
  editBtn: {
    color: '#007bff',
    fontSize: 16,
  },
  softDeleteBtn: {
    color: '#f59e0b',
    fontSize: 16,
  },
  noData: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    padding: 20,
    color: 'red',
    textAlign: 'center',
  },
});
