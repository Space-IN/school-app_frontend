// src/screens/Faculty/classes/StudentProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '@env';

const StudentProfileScreen = ({ route }) => {
  const { studentData } = route.params || {};
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentDetails = async () => {
    try {
      if (!studentData || !studentData.userId) {
        Alert.alert('Error', 'Student information not available');
        return;
      }

      console.log('Fetching student details for:', studentData.userId);
      
      // Fetch complete student data from API
      const response = await axios.get(`${BASE_URL}/api/admin/students/${studentData.userId}`);
      console.log('Student API response:', response.data);
      
      setStudent(response.data);
    } catch (error) {
      console.error('❌ Error fetching student details:', error);
      console.error('Error details:', error.response?.data);
      
      // If API fails, use the passed studentData as fallback
      if (studentData) {
        setStudent(studentData);
        Alert.alert('Info', 'Using limited student information');
      } else {
        Alert.alert('Error', 'Failed to load student profile');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Student Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4b4bfa" />
          <Text style={styles.loadingText}>Loading student profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👤 Student Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#d9534f" />
          <Text style={styles.errorText}>Student profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Student Profile</Text>
      </View>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          {/* Student Basic Info */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#4b4bfa" />
            </View>
            <Text style={styles.name}>{student.name || 'N/A'}</Text>
            <Text style={styles.userId}>ID: {student.userId || 'N/A'}</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={18} color="#4a90e2" /> Personal Information
            </Text>
            
            <DetailRow label="Date of Birth" value={formatDate(student.dob)} />
            <DetailRow label="Gender" value={student.gender} />
            <DetailRow label="Blood Group" value={student.bloodGroup} />
            <DetailRow label="Address" value={student.address} />
          </View>

          {/* Academic Information */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="school-outline" size={18} color="#4a90e2" /> Academic Information
            </Text>
            
            <DetailRow label="Class" value={student.className} />
            <DetailRow label="Section" value={student.section} />
            <DetailRow label="Admission Date" value={formatDate(student.admissionDate)} />
          </View>

          {/* Parent Information */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="people-outline" size={18} color="#4a90e2" /> Parent Information
            </Text>
            
            <DetailRow label="Father's Name" value={student.fatherName} />
            <DetailRow label="Father's Occupation" value={student.fatherOccupation} />
            <DetailRow label="Father's Contact" value={student.fatherContact} />
            <DetailRow label="Mother's Name" value={student.motherName} />
            <DetailRow label="Mother's Occupation" value={student.motherOccupation} />
            <DetailRow label="Mother's Contact" value={student.motherContact} />
            <DetailRow label="Parent Email" value={student.parentEmail} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Detail Row Component
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  header: {
    paddingVertical: 15,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3e9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#4b4bfa',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 4,
  },
  userId: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1.5,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
});

export default StudentProfileScreen;