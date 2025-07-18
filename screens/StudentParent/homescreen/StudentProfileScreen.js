// screens/StudentProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

const iconMap = {
  name: 'person',
  userId: 'finger-print',
  className: 'school',
  section: 'layers',
  dob: 'calendar',
  gender: 'transgender',
  bloodGroup: 'water',
  admissionDate: 'calendar-outline',
  address: 'home',
};

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());

const allowedKeys = [
  'name',
  'userId',
  'className',
  'section',
  'dob',
  'gender',
  'bloodGroup',
  'admissionDate',
  'address',
];

const StudentProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const parsed = stored ? JSON.parse(stored) : null;

      if (!parsed || parsed.role !== 'Student') {
        Alert.alert('Error', 'Invalid student login');
        return;
      }

      const userId = parsed.userId;
      const response = await axios.get(`${BASE_URL}/api/admin/students/${userId}`);
      setProfile(response.data);
    } catch (err) {
      console.error('❌ Error loading profile:', err);
      Alert.alert('Error', 'Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 10, color: '#333' }}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: 'red' }}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Student Profile</Text>

      {allowedKeys.map((key) => {
        const value = profile[key];
        return (
          <View key={key} style={styles.itemContainer}>
            <View style={styles.item}>
              <Ionicons
                name={iconMap[key] || 'information-circle-outline'}
                size={24}
                color="#2c3e50"
                style={styles.icon}
              />
              <View style={styles.textContainer}>
                <Text style={styles.label}>{formatLabel(key)}</Text>
                <Text style={styles.value}>{value || 'N/A'}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default StudentProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f0f4ff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#f0f4ff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#2c3e50',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flexShrink: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  value: {
    fontSize: 17,
    color: '#4a4a4a',
  },
});
