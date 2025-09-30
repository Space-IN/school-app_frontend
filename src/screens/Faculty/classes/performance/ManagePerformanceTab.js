// screens/Faculty/classes/performance/ManagePerformanceTab.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Card, FAB } from 'react-native-paper';
import axios from 'axios';
import BASE_URL from '../../../../config/baseURL';

const ManagePerformanceTab = ({ grade, section, navigation }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/student/students/all/grade/${grade}/section/${section}`);
        setStudents(res.data);
      } catch (err) {
        console.error('Error fetching students:', err.message);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [grade, section]);

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : students.length === 0 ? (
        <Text>No students found</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.subText}>User ID: {item.userId}</Text>
              </Card.Content>
            </Card>
          )}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Marks"
        onPress={() =>
          navigation.navigate('StudentSubjectMarksScreen', {
            grade,
            section,
            students,
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#bbdbfaff',
    flex: 1,
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4a90e2',
  },
});

export default ManagePerformanceTab;
