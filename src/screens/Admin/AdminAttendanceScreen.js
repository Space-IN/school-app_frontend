import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BASE_URL } from '@env';
import {api} from '../../api/api'

export default function AdminAttendanceScreen({ route }) {
  const { grade, section } = route.params;

  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState('');

  const fetchAttendanceByDate = async (date) => {
    if (!date) return;

    setSelectedDate(date);
    setLoading(true);
    setAttendanceData([]);
    setNoDataMessage('');

    try {
      const url = `${BASE_URL}/api/attendance`;
      const params = {
        grade: String(grade).replace('Grade ', ''),
        section: String(section),
        date,
      };
      console.log('Fetching attendance from URL:', url, 'with params:', params);

      const res = await api.get(url, { params });
      console.log('Attendance response:', res.data);

      if (Array.isArray(res.data) && res.data.length > 0) {
        setAttendanceData(res.data[0]?.records || []);
        if (res.data[0]?.records?.length === 0) {
          setNoDataMessage('No attendance records for this date.');
        }
      } else if (res.data.message) {
        setNoDataMessage(res.data.message);
        setAttendanceData([]);
      } else {
        setNoDataMessage('No attendance records for this date.');
        setAttendanceData([]);
      }
    } catch (err) {
      setAttendanceData([]);
      setNoDataMessage('No attendance records for this date.');
    } finally {
      setLoading(false);
    }
  };

  const renderStudent = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.student.name} ({item.student.userId})
      </Text>
      {item.sessions.map((session) => (
        <View key={session._id} style={styles.sessionRow}>
          <Text style={styles.sessionText}>Session {session.session_number}:</Text>
          <Text
            style={[
              styles.statusText,
              session.status === 'present' ? styles.present : styles.absent,
            ]}
          >
            {session.status.toUpperCase()}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>
        📅 Attendance for Grade {grade} - Section {section}
      </Text>

      {/* Show calendar only if no date selected */}
      {!selectedDate && (
        <Calendar
          onDayPress={(day) => fetchAttendanceByDate(day.dateString)}
        />
      )}

      {/* Show "Change Date" button when a date is selected */}
      {selectedDate && (
        <TouchableOpacity
          style={styles.changeDateButton}
          onPress={() => setSelectedDate(null)}
        >
          <Text style={styles.changeDateText}>📅 Change Date</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 20 }} />
      ) : noDataMessage ? (
        <Text style={styles.noData}>{noDataMessage}</Text>
      ) : (
        <FlatList
          data={attendanceData}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={renderStudent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffffff' },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20, marginTop: 10 },
  card: {
    backgroundColor: '#faebebff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  name: { fontWeight: 'bold', fontSize: 16, color: '#1e3a8a', marginBottom: 6 },
  sessionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  sessionText: { fontSize: 14, color: '#555' },
  statusText: { fontWeight: '600', fontSize: 14 },
  present: { color: 'green' },
  absent: { color: 'red' },
  noData: { padding: 20, textAlign: 'center', color: '#666', fontSize: 16 },
  changeDateButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginVertical: 15,
  },
  changeDateText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
