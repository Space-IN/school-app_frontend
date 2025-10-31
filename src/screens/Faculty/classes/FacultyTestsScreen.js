import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchAssessments } from '../../../controllers/studentDataController';

export default function FacultyTestsScreen({ route, navigation }) {
  const { grade, section, subjectId, subjectName } = route.params;
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAssessments = async () => {
      try {
        const year = new Date().getFullYear();
        const response = await fetchAssessments(grade, section, year);
        setAssessments(response.data);
      } catch (err) {
        setError('Failed to fetch assessments.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getAssessments();
  }, [grade, section]);

  const handlePress = (item) => {
    navigation.navigate('FacultyPerformanceScreen', {
      grade,
      section,
      subjectId,
      subjectName,
      test_name: item.test_name,
      year: new Date(item.date).getFullYear(),
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tests & Exams for {grade} - {section}</Text>
      <FlatList
        data={assessments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)} style={styles.card}>
            <Text style={styles.cardText}>{item.test_name}</Text>
            <Text style={styles.cardSubText}>{new Date(item.date).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: { fontSize: 16, fontWeight: 'bold' },
  cardSubText: { fontSize: 14, color: 'gray' },
  errorText: { fontSize: 16, color: 'red' },
});