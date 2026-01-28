import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from "../../../context/authContext"
import { api } from '../../../api/api'


export default function FacultyProfileScreen() {
  const { decodedToken, logout } = useAuth()
  const [faculty, setFaculty] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchFacultyDetails = async () => {
    console.log("it ran...")
    const facultyId = decodedToken?.preferred_username
    if(!facultyId) {
      Alert.alert('Error', 'Unable to fetch profile details. Please try again later.')
      return
    }

    setLoading(true)
    try {
      const response = await api.get(`/api/faculty/${facultyId}`)
      console.log("response: ", response)
      if(response.data) {
        setFaculty(response.data)
      }
    } catch(err) {
      console.error("error fetching faculty data: ", err)
      Alert.alert('Error', 'Unable to fetch profile details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout()
        },
      },
    ])
  }


  useEffect(() => {
    if(decodedToken?.preferred_username) fetchFacultyDetails()
  }, [decodedToken?.userId])


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
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#9c1006" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👨‍🏫 Faculty Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9c1006" />
          <Text style={styles.loadingText}>Loading faculty profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!faculty) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor="#9c1006" barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👨‍🏫 Faculty Profile</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#d9534f" />
          <Text style={styles.errorText}>Faculty profile not found</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchFacultyDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.retryButton, { marginTop: 15, backgroundColor: '#d9534f' }]} onPress={handleLogout}>
            <Text style={styles.retryButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#9c1006" barStyle="light-content" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent} // Added for bottom padding
      >
        <View style={styles.profileCard}>
          {/* Faculty Basic Info */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#9c1006" />
            </View>
            <Text style={styles.name}>{faculty.name || 'N/A'}</Text>
            <Text style={styles.userId}>ID: {faculty.userId || 'N/A'}</Text>
          </View>


          <View style={styles.actionsSection}>
            {/* <TouchableOpacity style={styles.actionButton} onPress={handleGoToNotices}>
              <Ionicons name="megaphone-outline" size={24} color="#4a90e2" />
              <Text style={styles.actionText}>Notice Board</Text>
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.actionButton} onPress={handleGoToCalendar}>
              <Ionicons name="calendar-outline" size={24} color="#4a90e2" />
              <Text style={styles.actionText}>Academic Calendar</Text>
            </TouchableOpacity> */}
          </View>

          {/* Personal Information */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={18} color="#9c1006" /> Personal Information
            </Text>

            <DetailRow label="Email" value={faculty.email} />
            <DetailRow label="Date of Birth" value={formatDate(faculty.dateOfBirth)} />
            <DetailRow label="Gender" value={faculty.gender} />
            <DetailRow label="Phone" value={faculty.phone} />
            <DetailRow label="Address" value={faculty.address} />
          </View>

          {/* Professional Information */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="briefcase-outline" size={18} color="#9c1006" /> Professional Information
            </Text>

            <DetailRow label="Faculty ID" value={faculty.userId} />
            <DetailRow label="Department" value={faculty.department} />
            <DetailRow label="Designation" value={faculty.designation} />
            <DetailRow label="Join Date" value={formatDate(faculty.joinDate)} />
          </View>
        </View>

        {/* NEW: Prominent Logout Button at the bottom */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.bottomLogoutButton}
        >
          <Ionicons name="log-out-outline" size={24} color="#ffffff" />
          <Text style={styles.bottomLogoutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

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
    backgroundColor: '#ffffffff',
  },
  // Standard Header style (used for main screen and loading/error states)
  header: {
    paddingVertical: 30,
    backgroundColor: '#c6d9eeff',
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
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  scrollContent: {
    paddingBottom: 30, // Extra space at the bottom for the button
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: 'rgb(226, 225, 225)',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20, // Add spacing before the logout button
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
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
    borderColor: '#9c1006',
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
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    minWidth: 100,
    elevation: 2,
  },
  actionText: {
    marginTop: 6,
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '600',
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
  // New styles for the bottom Logout button
  bottomLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d9534f', // Distinctive red color for destructive action
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomLogoutText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: '700',
    fontSize: 18,
  },
});
