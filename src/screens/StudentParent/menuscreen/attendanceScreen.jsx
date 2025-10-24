import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BASE_URL from '../../../config/baseURL';

const SESSIONS_PER_DAY = 8; // Assuming 8 sessions per day

const AttendanceScreen = ({ route }) => {
  const { studentData } = route.params || {}
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, percentage: 0 });

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        if (!studentData?.userId) {
          Alert.alert('Error', 'Student ID is missing.');
          setLoading(false);
          return;
        }

        const res = await fetch(`${BASE_URL}/api/attendance/student/${studentData?.userId}`);
        const data = await res.json();

        console.log('📦 Attendance response:', data);

        if (!Array.isArray(data)) {
          console.error('Unexpected data format:', data);
          Alert.alert('Error', data.message || 'Could not fetch attendance.');
          return;
        }

        setAttendanceData(data);
        calculateStats(data, studentData?.userId);
      } catch (error) {
        console.error('❌ Error fetching attendance:', error);
        Alert.alert('Error', 'Something went wrong while fetching attendance.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const calculateStats = (data, studentId) => {
    let totalPresent = 0;
    let totalSessions = 0;

    data.forEach(day => {
      const studentRecord = day.records.find(record => 
        record.student.toString() === studentId
      );

      if (studentRecord) {
        studentRecord.sessions.forEach(session => {
          totalSessions++;
          if (session.status === 'present') {
            totalPresent++;
          }
        });
      }
    });

    const percentage = totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0;

    setStats({
      present: totalPresent,
      absent: totalSessions - totalPresent,
      percentage: percentage.toFixed(1)
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/api/attendance/student/${studentData?.userId}`);
      const data = await res.json();
      setAttendanceData(data);
      calculateStats(data, studentData?.userId);
    } catch (error) {
      console.error('Error refreshing attendance:', error);
      Alert.alert('Error', 'Failed to refresh attendance data');
    }
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const studentRecord = item.records.find(
      record => record.student.toString() === studentData?.userId
    );

    if (!studentRecord) return null;

    const date = new Date(item.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return (
      <View style={styles.card}>
        <Text style={styles.dateLabel}>📅 {date}</Text>
        <Text style={styles.gradeSection}>Grade {item.grade}-{item.section}</Text>
        <View style={styles.sessionsContainer}>
          {Array.from({ length: SESSIONS_PER_DAY }).map((_, index) => {
            const session = studentRecord.sessions.find(
              s => s.session_number === index + 1
            );
            const status = session?.status || 'NA';
            
            return (
              <View
                key={index}
                style={[
                  styles.sessionBadge,
                  status === 'present' && styles.presentBadge,
                  status === 'absent' && styles.absentBadge
                ]}
              >
                <Text style={styles.sessionNumber}>{index + 1}</Text>
                <Text style={[
                  styles.statusText,
                  status === 'present' && styles.presentText,
                  status === 'absent' && styles.absentText
                ]}>
                  {status === 'present' ? 'P' : status === 'absent' ? 'A' : '-'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{studentData?.attendancePercentage}%</Text>
            <Text style={styles.statLabel}>Present %</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{(100 - studentData?.attendancePercentage).toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Absent %</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#c01e12ff" />
        </View>
      ) : (
        <FlatList
          data={attendanceData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#c01e12ff"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c01e12ff',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  gradeSection: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  sessionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sessionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  presentBadge: {
    backgroundColor: '#dcfce7',
  },
  absentBadge: {
    backgroundColor: '#fee2e2',
  },
  sessionNumber: {
    fontSize: 12,
    color: '#64748b',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  presentText: {
    color: '#16a34a',
  },
  absentText: {
    color: '#dc2626',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default AttendanceScreen;
