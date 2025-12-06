import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as Animatable from 'react-native-animatable';
import { useStudent } from '../../../context/student/studentContext';
import { BASE_URL } from '@env'
import axios from 'axios'


const AttendanceScreen = () => {
  const { studentData } = useStudent()
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentData?.userId) {
        Alert.alert('Error', 'Could not identify student.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/api/student/attendance/${studentData?.userId}?grade=${studentData?.className}&section=${studentData?.section}`
        )
        const data = await response.data

        if (response.status===200) {
          setAttendanceData(data);
        } else {
          Alert.alert('Error', data.message || 'Failed to fetch attendance.');
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentData]);

  const { markedDates, attendanceStats } = useMemo(() => {
    const dates = {};
    let presentSessions = 0;
    let absentSessions = 0;

    attendanceData.forEach(record => {
      const date = record.date.split('T')[0];
      let dailyPresent = 0;
      let dailyAbsent = 0;

      record.sessions.forEach(session => {
        if (session.status === 'present') {
          presentSessions++;
          dailyPresent++;
        } else {
          absentSessions++;
          dailyAbsent++;
        }
      });

      if (dailyAbsent > 0) {
        dates[date] = { marked: true, dotColor: '#ef4444', activeOpacity: 0.5 };
      } else if (dailyPresent > 0) {
        dates[date] = { marked: true, dotColor: '#22c55e', activeOpacity: 0.5 };
      }
    });

    const totalSessions = presentSessions + absentSessions;
    const percentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

    return {
      markedDates: dates,
      attendanceStats: {
        present: presentSessions,
        absent: absentSessions,
        total: totalSessions,
        percentage: percentage.toFixed(1),
      },
    };
  }, [attendanceData]);

  const onDayPress = day => {
    setSelectedDate(day.dateString);
    setIsModalVisible(true);
  };

  const renderSessionDetails = () => {
    if (!selectedDate) return null;

    const record = attendanceData.find(r => r.date.startsWith(selectedDate));
    if (!record) {
      return <Text style={styles.modalText}>No attendance recorded for this day.</Text>;
    }

    return record.sessions.map((session, index) => (
      <View key={index} style={styles.sessionRow}>
        <Text style={styles.sessionText}>Session {session.session_number}</Text>
        <Text
          style={[
            styles.statusText,
            { color: session.status === 'present' ? '#22c55e' : '#ef4444' },
          ]}
        >
          {session.status}
        </Text>
      </View>
    ));
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#c01e12" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View animation="fadeInDown" style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{studentData?.attendancePercentage}%</Text>
          <Text style={styles.statLabel}>Overall Attendance</Text>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attendanceStats.present}</Text>
            <Text style={styles.statLabel}> Sessions Present</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{attendanceStats.absent}</Text>
            <Text style={styles.statLabel}> Sessions Absent</Text>
          </View>
        </View>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={300}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#c01e12',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#c01e12',
            dayTextColor: '#2d4150',
            arrowColor: '#c01e12',
            monthTextColor: '#c01e12',
            indicatorColor: 'blue',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
        />
      </Animatable.View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Attendance for {selectedDate}
            </Text>
            {renderSessionDetails()}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c01e12',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sessionText: {
    fontSize: 16,
    color: '#374151',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  closeButton: {
    marginTop: 25,
    backgroundColor: '#c01e12',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default AttendanceScreen;