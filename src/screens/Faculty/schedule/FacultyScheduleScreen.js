import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '@env';
import { useAuth } from "../../../context/authContext";
import { useScrollToTop } from '@react-navigation/native';
import { api } from '../../../api/api';

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const SUBJECT_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'],
];

export default function FacultySchedulesScreen() {
  const { decodedToken } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [facultyName, setFacultyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()]);

  const scrollRef = useRef(null);
  useScrollToTop(scrollRef);

  useEffect(() => {
    fetchFacultySchedule();
  }, []);

  const fetchFacultySchedule = async () => {
    try {
      setLoading(true);
      
      const facultyId = decodedToken?.preferred_username;
      
      if (!facultyId) {
        Alert.alert('Error', 'Faculty ID not found');
        return;
      }

      console.log('Fetching schedule for faculty:', facultyId);
      
      const res = await api.get(`/api/faculty/schedule/faculty/${facultyId}`);
      console.log('Schedule API response:', res.data);
      
      setFacultyName(res.data.facultyName);
      setSchedule(res.data.schedule || []);
    } catch (err) {
      console.error('❌ Error fetching faculty schedule:', err);
      console.error('Error details:', err.response?.data);
      Alert.alert('Error', err.response?.data?.message || 'Could not fetch schedule');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFacultySchedule();
  };

  const groupScheduleByDay = (scheduleArray) => {
    const grouped = {};
    scheduleArray.forEach(({ day, periods, classAssigned, section }) => {
      if (!grouped[day]) grouped[day] = [];
      periods.forEach((p) =>
        grouped[day].push({
          ...p,
          classAssigned,
          section,
        })
      );
    });
    return grouped;
  };

  const getColorForPeriod = (index) => {
    return SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  };

  const getDaySchedule = () => {
    const groupedSchedule = groupScheduleByDay(schedule);
    return groupedSchedule[selectedDay] || [];
  };

  const daySchedule = getDaySchedule();
  const totalPeriods = daySchedule.length;

  const renderPeriodCard = (period, index) => {
    const colors = getColorForPeriod(index);

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        duration={600}
        style={styles.periodCard}
        key={index}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.periodInner}>
            <View style={styles.periodTop}>
              <View style={styles.periodBadge}>
                <Text style={styles.periodBadgeText}>P{period.periodNumber}</Text>
              </View>
              <View style={styles.timeChip}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.timeText}>{period.timeSlot}</Text>
              </View>
            </View>

            <View style={styles.periodMain}>
              <Text style={styles.subjectName}>
                {period.subjectMasterId?.name || 'N/A'}
              </Text>

              <View style={styles.classInfoRow}>
                <View style={styles.classChip}>
                  <Ionicons name="school-outline" size={16} color="#c01e12" />
                  <Text style={styles.classText}>
                    Class {period.classAssigned} - {period.section}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.periodFooter}>
              <View style={styles.durationBadge}>
                <Ionicons name="hourglass-outline" size={12} color="#8f1b1b" />
                <Text style={styles.durationText}>45 min</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <View style={styles.loaderCircle}>
            <ActivityIndicator size="large" color="#c01e12" />
          </View>
        </Animatable.View>
        <Text style={styles.loadingText}>Loading your schedule...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Flat Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <Text style={styles.headerSubtitle}>{facultyName}</Text>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelector}
        >
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayButton, isSelected && styles.selectedDayButton]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <LinearGradient
                    colors={['#c01e12', '#8b1313']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.dayButtonGradient}
                  />
                )}
                <Text style={[styles.dayButtonText, isSelected && styles.selectedDayText]}>
                  {day.substring(0, 3)}
                </Text>
                {isSelected && <View style={styles.dayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats Cards */}
      {totalPeriods > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalPeriods}</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalPeriods * 45}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{selectedDay.substring(0, 3)}</Text>
            <Text style={styles.statLabel}>Day</Text>
          </View>
        </View>
      )}

      {/* Schedule List */}
      <ScrollView
        ref={scrollRef}
        style={styles.body}
        contentContainerStyle={styles.scheduleContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#c01e12']}
            tintColor="#c01e12"
          />
        }
      >
        {daySchedule.length === 0 ? (
          <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>No Classes Today</Text>
            <Text style={styles.emptyText}>
              Enjoy your free day! Check other days for your schedule.
            </Text>
          </Animatable.View>
        ) : (
          daySchedule.map((period, index) => renderPeriodCard(period, index))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loaderCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#c01e12',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  header: {
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    width: "95%",
    alignSelf: "center",
    borderRadius: 10,
    margin: 10,
    padding: 10,
    backgroundColor: '#c01e12',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.9,
  },
  daySelectorWrapper: {
    backgroundColor: '#ffffff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  daySelector: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedDayButton: {
    backgroundColor: 'transparent',
  },
  dayButtonGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  body: {
    flex: 1,
  },
  scheduleContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  periodCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 16,
  },
  periodInner: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
  },
  periodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c01e12',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  periodMain: {
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  classInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  classText: {
    fontSize: 13,
    color: '#991b1b',
    fontWeight: '600',
  },
  periodFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 11,
    color: '#8f1b1b',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});