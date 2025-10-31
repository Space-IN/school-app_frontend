import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function PastAttendanceScreen({ route }) {
  const { grade, section, subjectMasterId, facultyId } = route.params;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);

  useEffect(() => {
    fetchPastAttendance();
  }, [selectedDate]);

  const fetchPastAttendance = async () => {
    setLoading(true);
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const { data } = await axios.get(`${BASE_URL}/api/attendance`, {
        params: {
          classAssigned: grade,
          section,
          subjectMasterId,
          date: formattedDate,
          facultyId,
        },
      });

      const attendanceList = data[0]?.attendanceList || [];
      setRecords(attendanceList);
      setPresentCount(attendanceList.filter((r) => r.status === 'Present').length);
      setAbsentCount(attendanceList.filter((r) => r.status === 'Absent').length);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setRecords([]);
        setPresentCount(0);
        setAbsentCount(0);
      } else {
        console.error('Error fetching past attendance:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event, selected) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) setSelectedDate(selected);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📅 Past Attendance</Text>
        <Text style={styles.dateText}>{selectedDate.toISOString().split('T')[0]}</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateButtonText}>Change Date</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>

      {/* Summary Box */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>✅ Present: {presentCount}</Text>
        <Text style={styles.summaryText}>❌ Absent: {absentCount}</Text>
      </View>

      {/* Attendance List */}
      {loading ? (
        <ActivityIndicator size="large" color="#4b4bfa" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.studentId?._id || item._id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                item.status === 'Present' ? styles.present : styles.absent,
              ]}
            >
              <Text style={styles.name}>{item.studentName}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          )}
          ListEmptyComponent={
            !loading && (
              <Text style={styles.noData}>📭 No attendance found for this date.</Text>
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: '#c01e12ff',
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dateText: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 6,
  },
  dateButton: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
  },
  dateButtonText: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    marginHorizontal: 16,
    padding: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    elevation: 1,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    backgroundColor: '#ffffff',
    elevation: 1,
  },
  present: {
    backgroundColor: '#e2fce2',
  },
  absent: {
    backgroundColor: '#fde2e2',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  status: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },
  noData: {
    textAlign: 'center',
    color: '#888',
    fontSize: 15,
    marginTop: 40,
  },
});
