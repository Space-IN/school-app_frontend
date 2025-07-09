// screens/admin/DeletedFacultyScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../config/baseURL';

export default function DeletedFacultyScreen({ navigation }) {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedFaculty();
  }, []);

  const fetchDeletedFaculty = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/faculty/deleted`);
      setFaculty(res.data || []);
    } catch (err) {
      console.error('❌ Error fetching deleted faculty:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (userId) => {
    try {
      await axios.patch(`${BASE_URL}/api/admin/faculty/restore/${userId}`);
      Alert.alert('Restored', 'Faculty has been restored successfully.');
      fetchDeletedFaculty();
    } catch (err) {
      console.error('❌ Restore failed:', err.message);
      Alert.alert('Error', 'Failed to restore faculty.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>🧑‍🏫 Soft Deleted Faculty</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" />
      ) : faculty.length === 0 ? (
        <Text style={styles.noData}>No soft deleted faculty found.</Text>
      ) : (
        <FlatList
          data={faculty}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name} ({item.userId})</Text>
              <Text style={styles.details}>
                Grades: {Array.isArray(item.grades) ? item.grades.join(', ') : item.classAssigned || 'N/A'}
              </Text>
              <Text style={styles.details}>
                Subjects: {Array.isArray(item.subjects) ? item.subjects.join(', ') : item.subject || 'N/A'}
              </Text>

              <TouchableOpacity
                style={styles.restoreButton}
                onPress={() => handleRestore(item.userId)}
              >
                <Text style={styles.restoreText}>🔄 Restore</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f0f4ff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    padding: 16,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
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
  restoreButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  restoreText: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
});
