import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminStudentProfileView({ route }) {
  const { student } = route.params;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime()) || date.getFullYear() > 9999) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return 'N/A';

      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age > 0 && age < 100 ? `${age} years` : 'N/A';
    } catch {
      return 'N/A';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#ac1d1dff" barStyle="light-content" />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons
                name={student.gender === 'Female' ? 'woman' : 'man'}
                size={50}
                color="#ac1d1dff"
              />
            </View>
            <Text style={styles.name}>{student.name || 'N/A'}</Text>
            <Text style={styles.userId}>
              Student ID: {student.userId || 'N/A'}
            </Text>
            <View style={styles.classInfoBadge}>
              <Text style={styles.classInfoText}>
                Class {student.className} - Section {student.section}
              </Text>
            </View>
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={20} color="#ac1d1dff" />
              <Text style={styles.statLabel}>Age</Text>
              <Text style={styles.statValue}>
                {calculateAge(student.dob)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={20} color="#e74c3c" />
              <Text style={styles.statLabel}>Blood Group</Text>
              <Text style={styles.statValue}>
                {student.bloodGroup || 'N/A'}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons
                name="male-female-outline"
                size={20}
                color="#9b59b6"
              />
              <Text style={styles.statLabel}>Gender</Text>
              <Text style={styles.statValue}>
                {student.gender || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="person-outline" size={18} color="#ac1d1dff" /> Personal
              Information
            </Text>
            <DetailRow
              icon="calendar"
              label="Date of Birth"
              value={formatDate(student.dob)}
            />
            <DetailRow
              icon="location"
              label="Address"
              value={student.address}
            />
            <DetailRow
              icon="calendar-outline"
              label="Admission Date"
              value={formatDate(student.admissionDate)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="man-outline" size={18} color="#ac1d1dff" /> Father's
              Information
            </Text>
            <DetailRow
              icon="person"
              label="Name"
              value={student.fatherName}
            />
            <DetailRow
              icon="briefcase"
              label="Occupation"
              value={student.fatherOccupation}
            />
            <DetailRow
              icon="call"
              label="Contact"
              value={student.fatherContact}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="woman-outline" size={18} color="#ac1d1dff" /> Mother's
              Information
            </Text>
            <DetailRow
              icon="person"
              label="Name"
              value={student.motherName}
            />
            <DetailRow
              icon="briefcase"
              label="Occupation"
              value={student.motherOccupation}
            />
            <DetailRow
              icon="call"
              label="Contact"
              value={student.motherContact}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="mail-outline" size={18} color="#ac1d1dff" /> Contact
              Information
            </Text>
            <DetailRow
              icon="mail"
              label="Parent Email"
              value={student.parentEmail || 'Not Provided'}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#ac1d1dff"
              />{' '}
              Account Status
            </Text>
            <View style={styles.statusRow}>
              <Ionicons
                name={student.deleted ? 'close-circle' : 'checkmark-circle'}
                size={24}
                color={student.deleted ? '#e74c3c' : '#27ae60'}
              />
              <Text
                style={[
                  styles.statusText,
                  student.deleted
                    ? styles.deletedStatus
                    : styles.activeStatus,
                ]}
              >
                {student.deleted ? 'Deleted' : 'Active'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabelContainer}>
      <Ionicons name={icon} size={16} color="#666" style={styles.detailIcon} />
      <Text style={styles.detailLabel}>{label}:</Text>
    </View>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fecaca',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  scrollContent: {
    paddingBottom: 30,
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
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 4,
    borderColor: '#ac1d1dff',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ac1d1dff',
    textAlign: 'center',
    marginBottom: 4,
  },
  userId: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  classInfoBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  classInfoText: {
    color: '#ac1d1dff',
    fontWeight: '600',
    fontSize: 14,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#dee2e6',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 20,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1.5,
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeStatus: {
    color: '#27ae60',
  },
  deletedStatus: {
    color: '#e74c3c',
  },
});
