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

export default function FacultyDashboard({ navigation }) {
  const [facultyInfo, setFacultyInfo] = useState(null);

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
      }
    };

    loadUser();
  }, []);

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

  const renderSubjectItem = ({ item }) => (
    <View style={styles.subjectCard}>
      <Text style={styles.subjectName}>{item.name}</Text>
      <Text style={styles.subjectDetails}>
        Class {item.grade} - {item.section}
      </Text>
    </View>
  );

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
      {facultyInfo.assignedSubjects?.length > 0 ? (
        <FlatList
          data={facultyInfo.assignedSubjects}
          renderItem={renderSubjectItem}
          keyExtractor={(item, index) => `${item.name}-${item.grade}-${item.section}-${index}`}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10, marginBottom: 20 }}
        />
      ) : (
        <Text style={{ color: '#666', marginBottom: 20 }}>No subjects assigned yet.</Text>
      )}

      <Text style={styles.sectionTitle}>Today's Schedule</Text>
      {renderScheduleTimeline()}
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
});
