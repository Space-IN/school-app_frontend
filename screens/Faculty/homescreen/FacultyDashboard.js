// screens/Faculty/homescreen/FacultyDashboard.js
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileHeader from '../../../components/ProfileHeader';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function FacultyDashboard({ navigation }) {
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const loadUser = async () => {
      const stored = await AsyncStorage.getItem('userData');
      const parsed = stored ? JSON.parse(stored) : null;

      if (parsed?.role !== 'Faculty') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'RoleSelection' }],
        });
      } else {
        setFacultyInfo(parsed);
        fetchAssignedSubjects(parsed.userId);
      }
    };

    loadUser();
  }, []);

 const fetchAssignedSubjects = async (facultyId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/subject/assigned/faculty/${facultyId}`
    );
    setSubjects(response.data || []);
  } catch (err) {
    console.error(`❌ Error fetching subjects for faculty ${facultyId}:`, err.message);
  }
};

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                  await AsyncStorage.removeItem('userData');
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'RoleSelection' }],
                  });
                },
              },
            ]);
          }}
          style={{ marginRight: 10 }}
        >
          <Text style={{ color: '#d9534f', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://10.221.34.140:5000/api/events');
        setEvents(response.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err.message);
      }
    };

    fetchEvents();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.date).toISOString().split('T')[0];
    return eventDate === today;
  });

  const handleGradePress = (grade) => {
    navigation.navigate('Classes', {
      screen: 'FacultyClassesScreen',
      params: {
        openGrade: grade,
        redirectedFromHome: true,
        grades: facultyInfo?.grades || [],
        userId: facultyInfo?.userId,
      },
    });
  };

  const renderGradeTile = ({ item }) => (
    <TouchableOpacity style={styles.gradeTile} onPress={() => handleGradePress(item)}>
      <Text style={styles.gradeText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderSubjectItem = ({ item }) => (
  <View style={styles.subjectCard}>
    <Text style={styles.subjectName}>{item.name}</Text>
    <Text style={styles.subjectDetails}>
      Class {item.classAssigned} - {item.section}
    </Text>
  </View>
);

  const renderScheduleTimeline = () => {
    const schedule = [
      { time: '9:00 AM', class: '9A - Math' },
      { time: '10:00 AM', class: '10B - Science' },
      { time: '11:30 AM', class: '11C - Social' },
      { time: '12:30 PM', class: '5A - Kannada' },
    ];

    return (
      <View style={styles.timelineContainer}>
        {schedule.map((item, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            {index !== schedule.length - 1 && <View style={styles.timelineLine} />}
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTime}>{item.time}</Text>
              <Text style={styles.timelineClass}>{item.class}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (!facultyInfo) {
    return (
      <View style={styles.container}>
        <Text>Loading faculty dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <ProfileHeader nameOrId={facultyInfo.name || facultyInfo.userId} />

      <Text style={styles.sectionTitle}>My Grades</Text>
      <FlatList
        data={facultyInfo.grades || []}
        renderItem={renderGradeTile}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gradesContainer}
      />

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


      <Text style={styles.sectionTitle}>Today's Schedule</Text>
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#1e3a8a',
  },
  gradesContainer: {
    gap: 10,
    marginBottom: 20,
  },
  gradeTile: {
    backgroundColor: '#4b4bfa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  gradeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  subjectCard: {
    backgroundColor: '#e3e9ff',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#4b4bfa',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  subjectDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  timelineContainer: {
    marginTop: 10,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderColor: '#4b4bfa',
    paddingBottom: 30,
  },
  timelineItem: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4b4bfa',
    marginRight: 10,
    marginTop: 4,
  },
  timelineLine: {
    position: 'absolute',
    top: 16,
    left: 5,
    width: 2,
    height: 40,
    backgroundColor: '#ccc',
  },
  timelineContent: {
    marginLeft: 10,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  timelineClass: {
    fontSize: 14,
    color: '#333',
  },
  
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
  eventBox: {
    marginBottom: 10,
  },
  eventTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#0f172a',
  },
  eventDesc: {
    color: '#334155',
    fontSize: 14,
  },
  noEvent: {
    color: '#6b7280',
    fontSize: 14,
  },
   

});


