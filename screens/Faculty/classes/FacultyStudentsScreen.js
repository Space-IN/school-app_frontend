// screens/faculty/FacultyStudentsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';
import { useNavigation } from '@react-navigation/native';

export default function FacultyStudentsScreen({ route }) {
  const { grade, section = 'A' } = route.params || {};
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`
      );
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentPress = (student) => {
    navigation.navigate('StudentProfileScreen', {
      studentData: student,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleStudentPress(item)} style={styles.card}>
      <Text style={styles.studentName}>👤 {item.name}</Text>
      <Text style={styles.studentId}>🆔 ID: {item.userId}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          📚 Students of Class {grade} - Section {section}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingVertical: 20,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
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
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  studentId: {
    fontSize: 14,
    marginTop: 5,
    color: '#555',
  },
});
