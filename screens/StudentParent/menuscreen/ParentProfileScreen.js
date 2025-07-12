import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function ParentProfileScreen() {
  const [parentData, setParentData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentData = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const parsed = JSON.parse(stored);
      const userId = parsed?.userId;

      const res = await axios.get(`${BASE_URL}/api/admin/students/${userId}`);
      setParentData(res.data);
    } catch (err) {
      console.error('❌ Error fetching parent profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  if (!parentData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Unable to load parent profile.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Parent Profile</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Father</Text>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{parentData.fatherName || 'N/A'}</Text>

          <Text style={styles.label}>Occupation:</Text>
          <Text style={styles.value}>{parentData.fatherOccupation || 'N/A'}</Text>

          <Text style={styles.label}>Contact:</Text>
          <Text style={styles.value}>{parentData.fatherContact || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mother</Text>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{parentData.motherName || 'N/A'}</Text>

          <Text style={styles.label}>Occupation:</Text>
          <Text style={styles.value}>{parentData.motherOccupation || 'N/A'}</Text>

          <Text style={styles.label}>Contact:</Text>
          <Text style={styles.value}>{parentData.motherContact || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Additional</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{parentData.parentEmail || 'N/A'}</Text>

          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{parentData.address || 'N/A'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#111827',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
});
