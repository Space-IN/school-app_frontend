// screens/Admin/FacultyProfileViewScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
 
import { BASE_URL } from '@env';
import {api} from '../../../api/api'

export default function FacultyProfileViewScreen({ route }) {
  const { userId } = route.params;
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get(`/api/admin/faculty/${userId}`);
        setFaculty(res.data);
      } catch (err) {
        console.error('❌ Error fetching faculty profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    );
  }

  if (!faculty) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: 'red' }}>Failed to load faculty profile.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerCard}>
          <Text style={styles.name}>{faculty.name}</Text>
          <Text style={styles.subText}>{faculty.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{faculty.userId}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{faculty.gender}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>
            {new Date(faculty.dateOfBirth).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>{faculty.phone}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{faculty.address}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff', 
  },
  container: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bbdbfaff',
  },
   headerCard: {
    backgroundColor: '#c01e12ff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 20,   
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subText: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  infoCard: {
    backgroundColor: '#faebebff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
});
