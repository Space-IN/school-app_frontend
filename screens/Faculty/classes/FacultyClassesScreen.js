// FacultyClassesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function FacultyClassesScreen({ navigation, route }) {
  const { userId } = route.params || {};
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  const fetchAssignedClasses = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/schedule/faculty/${userId}`);
      const schedule = data.schedule;
      const uniqueClasses = [];
      const seen = new Set();

      schedule.forEach(item => {
        const key = `${item.classAssigned}-${item.section}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueClasses.push(item);
        }
      });

      setAssignedClasses(uniqueClasses);
    } catch (err) {
      console.error('Error fetching assigned classes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item) => {
    navigation.navigate('FacultyClassDashboard', {
      grade: item.classAssigned,
      section: item.section,
      scheduleItem: item,
      facultyId: userId,
    });
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#4b4bfa" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Assigned Classes</Text>
      <FlatList
        data={assignedClasses}
        keyExtractor={(item, i) => `${item.classAssigned}-${item.section}-${i}`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)} style={styles.card}>
            <Text style={styles.cardText}>{`${item.classAssigned} – ${item.section}`}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 20, backgroundColor: '#4b4bfa', borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  cardText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
