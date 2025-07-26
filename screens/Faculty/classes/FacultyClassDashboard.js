import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View,Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import  Ionicons  from '@expo/vector-icons/Ionicons';
import BASE_URL from '../../../config/baseURL';

export default function FacultyClassDashboard({ navigation, route }) {
  const { grade, section, facultyId, redirectedFromHome } = route.params || {};
  const [scheduleItem, setScheduleItem] = useState(null);
  const [subjectMasterId, setSubjectMasterId] = useState(undefined);
  const [subjectName, setSubjectName] = useState('Unknown');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/api/schedule/class/${grade}/section/${section}`
        );
        const data = await response.json();

        if (data?.weeklySchedule) {
          console.log('📦 [INFO] Fetched Schedule:', data);
          setScheduleItem(data);
        } else {
          console.warn('❌ No weeklySchedule found');
        }
      } catch (error) {
        console.error('❌ Error fetching schedule:', error.message);
      }
    };

    fetchSchedule();
  }, [grade, section]);

  useEffect(() => {
    if (!scheduleItem?.weeklySchedule) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const today = todayName.trim().toLowerCase();

    console.log('📅 [INFO] Today is:', todayName);
    console.log('🗓️ [DEBUG] Weekly Schedule:', scheduleItem?.weeklySchedule);

    const todaySchedule = scheduleItem.weeklySchedule.find(
      (d) => d.day?.trim().toLowerCase() === today
    );

    console.log('📘 [INFO] Today’s Schedule for', todayName, ':', todaySchedule);

    let todayPeriod = null;
    if (todaySchedule?.periods?.length) {
      todayPeriod = todaySchedule.periods.find((p) => p.facultyId === facultyId);
    }

    console.log('🎯 [INFO] Matching Period Found:', todayPeriod);

    const smId =
      typeof todayPeriod?.subjectMasterId === 'object'
        ? todayPeriod.subjectMasterId._id
        : todayPeriod?.subjectMasterId;

    const subName =
      typeof todayPeriod?.subjectMasterId === 'object'
        ? todayPeriod.subjectMasterId.name
        : 'Unknown';

    setSubjectMasterId(smId);
    setSubjectName(subName);

    console.log('✅ [INFO] subjectMasterId:', smId);
    console.log('✅ [INFO] subjectName:', subName);
  }, [scheduleItem]);

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        if (redirectedFromHome) {
          console.log('🔙 [INFO] Redirected from Home, navigating to FacultyTabs → Home');
          navigation.navigate('FacultyTabs', {
            screen: 'Home',
            params: { userId: facultyId, grades: [grade] },
          });
          return true;
        }
        console.log('🔙 [INFO] Going back to previous screen');
        navigation.goBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [redirectedFromHome])
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: `${grade}'th  Class - section ${section}`});
  }, [navigation, grade]);

  const sections = [
    { title: 'Students', icon: 'people', screen: 'FacultyStudentsScreen' },
    { title: 'Attendance', icon: 'clipboard', screen: 'FacultyAttendanceScreen' },
   // { title: 'Assignments', icon: 'document-text', screen: 'FacultyAssignmentsScreen' },
    //{ title: 'Tests & Exams', icon: 'school', screen: 'FacultyTestsScreen' },
    { title: 'Performance', icon: 'bar-chart', screen: 'FacultyPerformanceScreen' },
    { title: 'My Schedule', icon: 'calendar', screen: 'FacultyScheduleScreen' },
  ];

  const handleCardPress = (screen) => {
    console.log('🧭 [ACTION] Navigating to:', screen);
    console.log('➡️ [DEBUG] Navigation Params →', {
      grade,
      section,
      facultyId,
      subjectMasterId,
      subjectName,
    });

    navigation.navigate(screen, {
      grade,
      section,
      facultyId,
      subjectMasterId,
      subjectName,
    });
  };

  return (
    <View style={styles.container}>
      {sections.map((sec) => (
        <TouchableOpacity
          key={sec.title}
          onPress={() => handleCardPress(sec.screen)}
          style={styles.card}
        >
          <Ionicons name={sec.icon} size={32} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.cardTitle}>{sec.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafe',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#4b4bfa',
    width: '47%',
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    },

    cardTitle: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
  textAlign: 'center',
},

  
});
