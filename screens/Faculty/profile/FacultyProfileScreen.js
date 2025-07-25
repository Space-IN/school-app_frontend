import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function FacultyProfileScreen() {
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        const parsed = stored ? JSON.parse(stored) : null;
        if (!parsed?.userId) return;


        const res = await axios.get(`http://10.221.34.141:5000/api/faculty/${parsed.userId}`);

        setFacultyData(res.data);
      } catch (err) {
        console.error('❌ Error fetching faculty data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  if (!facultyData) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>Unable to load profile information.</Text>
      </View>
    );
  }

  const profileFields = [
    { label: 'User ID', value: facultyData.userId },
    { label: 'Name', value: facultyData.name },
    { label: 'Email', value: facultyData.email },
    { label: 'Gender', value: facultyData.gender },
    { label: 'Date of Birth', value: new Date(facultyData.dateOfBirth).toDateString() },
    { label: 'Address', value: facultyData.address },
    { label: 'Phone', value: facultyData.phone },
  ];

  const handleGoToNotices = () => {
    navigation.navigate('NoticeBoardScreen', { userId: facultyData.userId , role : 'faculty' });
  };

  const handleGoToCalendar = () => {
    navigation.navigate('AcademicCalendarScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Faculty Profile</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleGoToNotices}>
          <Text style={styles.buttonText}>📢 View Notice Board</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleGoToCalendar}>
          <Text style={styles.buttonText}>📅 View Academic Calendar</Text>
        </TouchableOpacity>
      </View>

      {profileFields.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.label}>{item.label}:</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4ff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
  },
  value: {
    fontSize: 16,
    marginTop: 4,
    color: '#1f2937',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4b4bfa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
