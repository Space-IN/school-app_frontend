import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        const parsed = stored ? JSON.parse(stored) : null;

        if (parsed?.role === 'Admin' && parsed?.userId) {
          setUserId(parsed.userId);
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
        }
      } catch (err) {
        console.error('❌ Error loading userData:', err);
        navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userData');
          navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
        },
      },
    ]);
  };

  const handleAddStudent = () => navigation.navigate('AddStudentScreen');
  const handleAddFaculty = () => navigation.navigate('AddFacultyScreen');
  const handleViewStudents = () => navigation.navigate('AllStudentsScreen');
  const handleViewFaculty = () => navigation.navigate('AllFacultyScreen');
  const handleAddSubject = () => navigation.navigate('AddSubjectScreen');
  const handlePosterManagement = () => navigation.navigate('AdminPosterManager');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#d9534f" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <Text style={styles.greeting}>Hello, {userId} 👋</Text>
          <Text style={styles.subtitle}>Welcome to the Admin Dashboard</Text>
        </View>

        <Text style={styles.sectionTitle}>➕ Add Users</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.tileButton} onPress={handleAddStudent}>
            <Ionicons name="person-add" size={30} color="#fff" />
            <Text style={styles.tileText}>Add Student</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileButton} onPress={handleAddFaculty}>
            <Ionicons name="person-add-outline" size={30} color="#fff" />
            <Text style={styles.tileText}>Add Faculty</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>📋 View Users</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.tileButton} onPress={handleViewStudents}>
            <Ionicons name="school-outline" size={30} color="#fff" />
            <Text style={styles.tileText}>View Students</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tileButton} onPress={handleViewFaculty}>
            <Ionicons name="people-outline" size={30} color="#fff" />
            <Text style={styles.tileText}>View Faculty</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>📚 Subject Management</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.tileButton} onPress={handleAddSubject}>
            <Ionicons name="book-outline" size={30} color="#fff" />
            <Text style={styles.tileText}>Add Subject</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>📢 Manage Posters</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.tileButton} onPress={handlePosterManagement}>
            <Ionicons name="images-outline" size={30} color="#fff" />
            <Text style={styles.tileText}>Manage Posters</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 6,
    color: '#d9534f',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#e0ecff',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 12,
    color: '#1e3a8a',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tileButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    paddingVertical: 20,
    marginHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  tileText: {
    marginTop: 10,
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
