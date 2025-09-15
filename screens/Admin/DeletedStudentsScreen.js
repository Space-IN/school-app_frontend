import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../config/baseURL';

export default function DeletedStudentsScreen({ navigation }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDeletedStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/students-deleted`);
      setStudents(res.data || []);
    } catch (err) {
      console.error('❌ Failed to fetch deleted students:', err);
      Alert.alert('Error', 'Could not load deleted students');
    } finally {
      setLoading(false);
    }
  };

  const restoreStudent = async (userId) => {
    try {
      await axios.patch(`${BASE_URL}/api/admin/students/restore/${userId}`);
      Alert.alert('Restored', 'Student restored successfully.');
      fetchDeletedStudents();
    } catch (err) {
      Alert.alert('Error', 'Could not restore student.');
    }
  };

  const permanentlyDeleteStudent = async (userId) => {
    Alert.alert(
      'Delete Permanently',
      'Are you sure you want to permanently delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/admin/students/${userId}`);
              Alert.alert('Deleted', 'Student permanently deleted.');
              fetchDeletedStudents();
            } catch (err) {
              console.error('❌ Failed to permanently delete student:', err);
              Alert.alert('Error', 'Could not delete student permanently.');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchDeletedStudents();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>🗂️ Soft Deleted Students</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" />
      ) : students.length === 0 ? (
        <Text style={styles.noData}>No soft deleted students found.</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.name} ({item.userId})
              </Text>
              <Text style={styles.details}>
                Grade: {item.className} | Section: {item.section}
              </Text>

              <View style={styles.actions}>
                <TouchableOpacity onPress={() => restoreStudent(item.userId)}>
                  <Text style={styles.restoreBtn}>♻️ Restore</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => permanentlyDeleteStudent(item.userId)}>
                  <Text style={styles.deleteBtn}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#bbdbfaff',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#991b1b',
    padding: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffe4e6',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#991b1b',
  },
  details: {
    fontSize: 14,
    marginTop: 4,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  restoreBtn: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteBtn: {
    color: '#dc2626',
    fontWeight: 'bold',
    fontSize: 15,
  },
  noData: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
  },
});
