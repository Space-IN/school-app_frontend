import { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Platform, StatusBar, } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Animatable from 'react-native-animatable'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { useStudent } from '../../../context/studentContext'
import { api } from '../../../api/api'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const SUBJECT_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
  ['#a8edea', '#fed6e3'],
  ['#ff9a9e', '#fecfef'],
]




export default function TimetableScreen() {
  const { studentData, studentLoading } = useStudent()
  const navigation = useNavigation()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(DAYS[0])
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)


  const fetchSchedule = async () => {
    try {
      setError(null);
      setLoading(true);

      const grade = studentData?.className
      const section = studentData?.section
      if (!grade || !section) throw new Error('Class and section information not found')
      
      const response = await api.get(
        `/api/student/schedule/class/${grade}/section/${section}`
      )
      setSchedule(response.data)
    } catch(err) {
      console.error('error fetching schedule:', err)
      setError(err.response.data.message || 'Failed to load timetable')
    } finally {
      setLoading(false)
    }
  }


  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchSchedule().finally(() => setRefreshing(false))
  }, [])


  const getColorForPeriod = (index) => {
    return SUBJECT_COLORS[index % SUBJECT_COLORS.length]
  }

  const renderTimeSlot = (period, index) => {
    if (!period) return null

    const colors = getColorForPeriod(index)

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        duration={600}
        style={styles.periodCard}
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
                {period.subjectMasterId?.name || period.subjectName || 'Subject Not Assigned'}
              </Text>

              <View style={styles.teacherRow}>
                <View style={styles.teacherAvatar}>
                  <Ionicons name="person" size={16} color="#ffffff" />
                </View>
                <Text style={styles.teacherName}>
                  {facultyNames.length > 0 ? facultyNames.join(", ") : "Teacher TBD"}
                </Text>
              </View>
            </View>

            <View style={styles.periodFooter}>
              <View style={styles.durationBadge}>
                <Ionicons name="hourglass-outline" size={12} color="#8f1b1bff" />
                <Text style={styles.durationText}>45 min</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animatable.View>
    )
  }

  const getDaySchedule = () => {
    if (!schedule?.weeklySchedule) return []
    const daySchedule = schedule.weeklySchedule.find(
      (day) => day.day === selectedDay
    )
    return daySchedule?.periods || []
  }

  const daySchedule = getDaySchedule()
  const totalPeriods = daySchedule.length


  useEffect(() => {
    if (studentLoading) return
    fetchSchedule()
  }, [studentData, studentLoading])

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <View style={styles.loaderCircle}>
            <ActivityIndicator size="large" color="#c01e12" />
          </View>
        </Animatable.View>
        <Text style={styles.loadingText}>Loading your timetable...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Animatable.View animation="shake" style={styles.errorContainer}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSchedule}>
            <View style={[styles.retryGradient, { backgroundColor: '#f12a2aff' }]}>
              <Ionicons name="refresh" size={20} color="#ffffff" />
              <Text style={styles.retryText}>Retry</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#d72b2b', '#8b1313']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="caret-back-outline" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Timetable</Text>
            <Text style={styles.headerSubtitle}>
              {schedule?.classAssigned} - Section {schedule?.section}
            </Text>
          </View>
          {/* This empty view helps center the title correctly */}
          <View style={styles.headerRightPlaceholder} />
          {/* <View style={styles.headerBadge}>
            <Ionicons name="calendar" size={20} color="#667eea" />
          </View> */}
        </View>
      </LinearGradient>

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
                    colors={['#d72b2b', '#8b1313']}
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

      {totalPeriods > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="book-outline" size={20} color='#d72b2b' />
            <Text style={styles.statNumber}>{totalPeriods}</Text>
            <Text style={styles.statLabel}>Periods</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={20} color='#d72b2b' />
            <Text style={styles.statNumber}>{totalPeriods * 45}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={20} color='#d72b2b' />
            <Text style={styles.statNumber}>{selectedDay.substring(0, 3)}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scheduleContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#d72b2b']}
            tintColor='#8b1313'
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {daySchedule.map((period, index) => (
          <View key={period.periodNumber}>
            {renderTimeSlot(period, index)}
          </View>
        ))}


        {daySchedule.length === 0 && (
          <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>No Classes Today</Text>
            <Text style={styles.emptyText}>
              Enjoy your free day! Check other days for your schedule.
            </Text>
          </Animatable.View>
        )}
      </ScrollView>
    </SafeAreaView>
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

        shadowColor: '#d72b2b',
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
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#d72b2b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    gap: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 24 : 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#e0e7ff',
    fontWeight: '500',
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightPlaceholder: {
    width: 36, // Same as back button to balance layout
  },
  daySelectorWrapper: {
    backgroundColor: '#ffffff',
    marginTop: -15,
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
    color: '#d72b2b',
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
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teacherAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a71b1bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherName: {
    fontSize: 14,
    color: '#000000ff',
    fontWeight: '500',
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
    color: '#8f1b1bff',
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