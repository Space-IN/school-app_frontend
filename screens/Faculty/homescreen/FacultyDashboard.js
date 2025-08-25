import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileHeader from '../../../components/ProfileHeader';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';
import { Ionicons } from '@expo/vector-icons';
import PosterCarousel from '../../../components/PosterCarousel';

export default function FacultyDashboard({ navigation }) {
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [events, setEvents] = useState([]);
   

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('userData');
          navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="log-out-outline" size={20} color="#d9534f" />
          <Text style={{ color: '#d9534f', marginLeft: 4, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('userData');
      const parsed = stored ? JSON.parse(stored) : null;

      if (parsed?.role !== 'Faculty') {
        navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
      } else {
        setFacultyInfo(parsed);
        fetchAssignedSubjects(parsed.userId);
        fetchFacultySchedule(parsed.userId);
      }
    };

    loadUser();
  }, []);

  const fetchAssignedSubjects = async (facultyId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/subject/subjects/faculty/${facultyId}`);
      const rawSubjects = response.data || [];

const flattenedSubjects = rawSubjects.flatMap(subject =>
  subject.classSectionAssignments.map(assign => ({
    subjectName: subject.subjectName,
    classAssigned: assign.classAssigned,
    section: assign.section,
  }))
);

setSubjects(flattenedSubjects);

    } catch (err) {
      console.error(`❌ Error fetching subjects:`, err.message);
    }
  };

  const fetchFacultySchedule = async (facultyId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/schedule/faculty/${facultyId}`);
      const fullSchedule = res.data.schedule || [];

      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      const todayScheduleRaw = fullSchedule.filter(dayObj => dayObj.day === todayName);

      const todaySchedule = todayScheduleRaw.map(dayObj => ({
        ...dayObj,
        periods: dayObj.periods.map(period => ({
          ...period,
          classAssigned: dayObj.classAssigned,
          section: dayObj.section,
        }))
      }));

      setSchedule(todaySchedule);

      const gradeSet = new Set();
      todaySchedule.forEach(day => {
        day.periods.forEach(p => {
          const classAssigned = p.classAssigned;
          if (classAssigned) {
            const grade = classAssigned.trim().split(' ')[1]?.[0];
            if (grade) gradeSet.add(`Class ${grade}`);
          }
        });
      });
      // setGrades([...gradeSet]);
    } catch (err) {
      console.error('❌ Error fetching schedule:', err.message);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/events`);
        setEvents(response.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err.message);
      }
    };
    fetchEvents();
  }, []);

 

  const renderSubjectItem = ({ item }) => (
  <View style={styles.subjectCard}>
    <Text style={styles.subjectName}>{item.subjectName}</Text>
    <Text style={styles.subjectDetails}>Class {item.classAssigned} - Section {item.section}</Text>
  </View>
);


  const renderScheduleTimeline = () => {
    return (
      <View style={styles.timelineContainer}>
        {schedule.map((day, dayIdx) => (
          <View key={dayIdx} style={{ marginBottom: 16 }}>
            <Text style={styles.dayHeading}>{day.day}</Text>
            {day.periods.map((period, idx) => (
              <View key={idx} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTime}>
                    #{period.periodNumber} - {period.timeSlot}
                  </Text>
                  <Text style={styles.timelineClass}>
                    {period.classAssigned} {period.section} - {period.subjectMasterId?.name || 'Subject N/A'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.date).toISOString().split('T')[0];
    return eventDate === today;
  });

  if (!facultyInfo) {
    return (
      <View style={styles.container}>
        <Text>Loading faculty dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>

      <ProfileHeader nameOrId={facultyInfo.name || facultyInfo.userId}
      onPress={()=> navigation.navigate('FacultyProfileScreen')} />

     
       
       <PosterCarousel />

      <Text style={styles.sectionTitle}>My Subjects</Text>
      {subjects.length === 0 ? (
        <Text style={{ color: '#666', marginBottom: 20 }}>No subjects assigned yet.</Text>
      ) : (
        <FlatList
          data={subjects}
          renderItem={renderSubjectItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10, marginBottom: 20 }}
        />
      )}

      <Text style={styles.sectionTitle}>Today Schedule</Text>
      {renderScheduleTimeline()}

      <View style={styles.eventContainer}>
        <Text style={styles.eventHeader}>Today's Event</Text>
        {todayEvents.length > 0 ? (
          todayEvents.map((event, index) => (
            <View key={index} style={styles.eventBox}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDesc}>{event.description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noEvent}>No events for today.</Text>
        )}
      </View>

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafe',
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#1e3a8a',
  },
 
  subjectCard: {
    backgroundColor: '#e3e9ff',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#4b4bfa',
  },
  subjectName: { fontSize: 16, fontWeight: '600', color: '#1e3a8a' },
  subjectDetails: { fontSize: 14, color: '#555', marginTop: 4 },
  dayHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e3a8a',
  },
  timelineContainer: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderColor: '#4b4bfa',
    paddingBottom: 30,
  },
  timelineItem: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4b4bfa',
    marginRight: 10,
    marginTop: 4,
  },
  timelineContent: { marginLeft: 5 },
  timelineTime: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
  timelineClass: { fontSize: 14, color: '#333' },
  eventContainer: {
    marginTop: 25,
    marginHorizontal: 12,
    backgroundColor: '#e0f2fe',
    padding: 15,
    borderRadius: 12,
    marginBottom: 40,
  },
  eventHeader: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1d4ed8',
  },
  eventBox: { marginBottom: 10 },
  eventTitle: { fontWeight: '600', fontSize: 15, color: '#0f172a' },
  eventDesc: { color: '#334155', fontSize: 14 },
  noEvent: { color: '#6b7280', fontSize: 14 },
});
