import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { users } from '../../../data/mockUsers';


export default function FacultyStudentsScreen({ route }) {
  const { grade } = route.params || {};
  const formattedClass = grade.slice(0, -1); // Extract number (e.g., "9A" -> "9")

  // Filter students from mockUsers who match this class and section
  const studentList = Object.values(users).filter(user =>
    user.role === 'Student' &&
    user.className?.replace('th', '') === formattedClass &&
    grade.endsWith(user.section)
  );

  const renderStudent = ({ item }) => (
    <View style={styles.studentCard}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.subText}>Class: {item.className} - {item.section}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students in {grade}</Text>
      {studentList.length > 0 ? (
        <FlatList
          data={studentList}
          renderItem={renderStudent}
          keyExtractor={(item, index) => `${item.name}-${index}`}
        />
      ) : (
        <Text style={styles.noData}>No students found for {grade}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafe' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1e3a8a' },
  studentCard: {
    backgroundColor: '#e0e7ff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#1e40af' },
  subText: { fontSize: 14, color: '#555' },
  noData: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 20 },
});
