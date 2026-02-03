import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../api/api';

export default function FacultyProfileViewScreen({ route }) {
  const { facultyId } = route.params;

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await api.get('/api/admin/faculty', {
          params: { facultyId },
        });

        setFaculty(res.data?.data?.[0] || null);
      } catch (err) {
        console.error('❌ Error fetching faculty profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [facultyId]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString() : 'N/A';

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
        <Text style={{ color: 'red' }}>Failed to load faculty profile</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.idCard}>
          <View style={styles.header}>
            <Ionicons name="person-circle-outline" size={90} color="#ac1d1dff" />
            <Text style={styles.name}>{faculty.name}</Text>
            <Text style={styles.designation}>{faculty.designation}</Text>
            <Text style={styles.department}>{faculty.department}</Text>
          </View>

          <View style={styles.body}>
            <InfoRow icon="id-card-outline" label="User ID" value={faculty.userId} />
            <InfoRow icon="mail-outline" label="Email" value={faculty.email} />
            <InfoRow icon="call-outline" label="Phone" value={faculty.phone} />
            <InfoRow icon="male-female-outline" label="Gender" value={faculty.gender} />
            <InfoRow icon="calendar-outline" label="Date of Birth" value={formatDate(faculty.dateOfBirth)} />
            <InfoRow icon="school-outline" label="Board" value={faculty.board} />
            <InfoRow icon="calendar-number-outline" label="Join Date" value={formatDate(faculty.joinDate)} />
            <InfoRow icon="location-outline" label="Address" value={faculty.address} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Ionicons name={icon} size={18} color="#ac1d1dff" />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf2ff',
  },
  container: {
    padding: 20,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaf2ff',
  },

  idCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  header: {
    backgroundColor: '#fecaca',
    alignItems: 'center',
    paddingVertical: 25,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ac1d1dff',
    marginTop: 10,
  },
  designation: {
    fontSize: 16,
    color: '#ac1d1dff',
    marginTop: 4,
  },
  department: {
    fontSize: 14,
    color: '#ac1d1dff',
    marginTop: 2,
  },

  body: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    marginLeft: 10,
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#0f172a',
    maxWidth: '55%',
    textAlign: 'right',
  },
});
