// screens/Faculty/students/FacultyStudentsScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function FacultyStudentsScreen({ route }) {
  const { grade, section = 'A' } = route.params || {};
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.studentCard}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.id}>ID: {item.userId}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Students of Class {grade} - Section {section}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator size="large" color="#4b4bfa" />
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9ff',
    padding:20,
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
  studentCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  id: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
});
