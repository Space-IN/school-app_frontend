// screens/StudentParent/homescreen/StudentParentHome.js
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import ProfileHeader from '../../../components/ProfileHeader';
import axios from 'axios';
import { academicCalendar } from '../../../data/academicCalendar';
import PosterCarousel from '../../../components/PosterCarousel';

export default function StudentParentHome() {
  const route = useRoute();
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { width: screenWidth } = useWindowDimensions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [posterCount, setPosterCount] = useState(1); // Will update when posters are loaded

  const params = route.params || {};
  const { studentName, className, section, userId } = params;
  const displayName = studentName || userId || 'User';

  const profileData = {
    class: className || '10th Grade',
    medium: 'English',
    rollNumber: '23',
    dateOfBirth: '2008-06-15',
    currentAddress: '123 Main Street, Cityname',
    permanentAddress: '456 Village Road, Hometown',
    bloodGroup: 'O+',
    weight: '52 kg',
    height: '160 cm',
  };

  // 🔐 Logout
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Student/Parent Dashboard',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'RoleSelection' }],
                  });
                },
              },
            ]);
          }}
          style={{
            marginRight: 10,
            paddingVertical: 6,
            paddingHorizontal: 10,
            backgroundColor: '#d9534f',
            borderRadius: 6,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // 🔄 Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!className || !section) return;

      try {
        const res = await axios.get(
          `http://10.221.34.145:5000/api/admin/subjects/class/${className}/section/${section}`
        );
        setSubjects(res.data || []);
      } catch (err) {
        console.error('Failed to load subjects:', err.message);
      }
    };

    fetchSubjects();
  }, [className, section]);

  const today = new Date().toISOString().split('T')[0];
  const todayEvents = academicCalendar.filter((item) => item.date === today);

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('StudentProfile', { profile: profileData })}
      >
        <ProfileHeader nameOrId={displayName} className={className} section={section} />
      </TouchableOpacity>

      

      {/* ✅ New PosterCarousel replaces hardcoded image carousel */}
      <PosterCarousel />

      <Text style={styles.sectionTitle}>My Subjects</Text>

      <View style={styles.subjectGrid}>
        {Array.isArray(subjects) && subjects.length > 0 ? (
          subjects.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.subjectTile, { backgroundColor: item.color || '#60a5fa' }]}
              onPress={() =>
                navigation.navigate('SubjectDashboard', {
                  subjectName: item.name,
                  chapters: item.chapters || [],
                  announcements: item.announcements || [],
                })
              }
            >
              <Ionicons name={item.icon || 'book'} size={30} color="#fff" />
              <Text style={styles.subjectText}>{item.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ padding: 12, color: '#999' }}>No subjects found.</Text>
        )}
      </View>

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
  container: { flex: 1, backgroundColor: '#fff' },
  sliderHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  subjectTile: {
    width: '48%',
    minHeight: 100,
    marginBottom: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  subjectText: {
    marginTop: 8,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
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
