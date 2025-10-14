// screens/Faculty/schedule/ClassScheduleScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import axios from 'axios';
import { useAuth } from "../../../context/authContext";
import { BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ClassScheduleScreen({ route }) {
  const { user } = useAuth();
  const { grade, section } = route.params; // From FacultyClassDashboard
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Get the safe area insets
  const insets = useSafeAreaInsets();

  // Set header with back button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButtonHeader}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonTextHeader}>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    console.log('📱 ClassScheduleScreen - Received params:', { grade, section });
    fetchClassSchedule();
  }, []);

  const fetchClassSchedule = async () => {
    try {
      const facultyId = user?.userId;
      console.log('🔍 Fetching schedule for faculty:', facultyId);
      
      const res = await axios.get(`${BASE_URL}/api/schedule/faculty/${facultyId}`);
      console.log('📦 Full API Response:', JSON.stringify(res.data, null, 2));
      
      // Check different possible response structures
      const scheduleData = res.data.schedule || res.data || [];
      console.log('📊 Schedule data to filter:', scheduleData);
      
      // Filter for specific class only
      const classSchedule = scheduleData.filter(item => {
        console.log('🔍 Checking item:', {
          itemClass: item.classAssigned,
          itemSection: item.section,
          targetClass: grade,
          targetSection: section,
          matches: item.classAssigned === grade && item.section === section
        });
        return item.classAssigned === grade && item.section === section;
      });
      
      console.log('✅ Filtered class schedule:', classSchedule);
      setSchedule(classSchedule);
      
    } catch (err) {
      console.error('❌ Error fetching class schedule:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const groupScheduleByDay = (scheduleArray) => {
    console.log('📅 Grouping schedule:', scheduleArray);
    const grouped = {};
    scheduleArray.forEach(({ day, periods }) => {
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(...periods);
    });
    console.log('📊 Grouped schedule:', grouped);
    return grouped;
  };

  const groupedSchedule = groupScheduleByDay(schedule);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
        <View style={styles.container}>
          {/* Header with Manual Top Safe Area */}
          <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                onPress={handleBackPress}
                style={styles.backButtonContainer}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>
              📘 Class {grade}-{section} Schedule
            </Text>
          </View>
          
          <ScrollView style={styles.body}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4b4bfa" />
                <Text style={styles.loadingText}>Loading schedule...</Text>
              </View>
            ) : Object.keys(groupedSchedule).length === 0 ? (
              <View style={styles.noScheduleContainer}>
                <Text style={styles.noSchedule}>No schedule found for Class {grade}-{section}</Text>
                <Text style={styles.debugInfo}>
                  Check console logs for API response details
                </Text>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={handleBackPress}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            ) : (
              Object.entries(groupedSchedule).map(([day, periods]) => (
                <View key={day} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{day}</Text>
                  {periods.map((period, index) => (
                    <View key={index} style={styles.periodRow}>
                      <Text style={styles.periodNumber}>Period {period.periodNumber}</Text>
                      <Text style={styles.timeSlot}>{period.timeSlot}</Text>
                      <Text style={styles.subject}>
                        {period.subjectMasterId?.name || period.subject || 'Free Period'}
                      </Text>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  container: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  header: {
    paddingVertical: 15,
    backgroundColor: '#4a90e2',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    padding: 5,
  },
  backButtonTextHeader: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#4b4bfa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    flex: 1,
    padding: 16,
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
  noScheduleContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
  },
  noSchedule: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  debugInfo: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#1e3a8a',
  },
  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  periodNumber: {
    fontWeight: '600',
    color: '#333',
  },
  timeSlot: {
    color: '#666',
  },
  subject: {
    fontWeight: '500',
    color: '#4a90e2',
  },
});










