// import React, { useLayoutEffect, useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
// import { useFocusEffect } from '@react-navigation/native';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import BASE_URL from '../../../config/baseURL';

// export default function FacultyClassDashboard({ navigation, route }) {
//   const { grade, section, facultyId, redirectedFromHome } = route.params || {};
//   const [scheduleItem, setScheduleItem] = useState(null);
//   const [subjectMasterId, setSubjectMasterId] = useState(undefined);
//   const [subjectName, setSubjectName] = useState('Unknown');

//   useEffect(() => {
//     const fetchSchedule = async () => {
//       try {
//         const response = await fetch(
//           `${BASE_URL}/api/schedule/class/${grade}/section/${section}`
//         );
//         const data = await response.json();

//         if (data?.weeklySchedule) {
//           console.log('📦 [INFO] Fetched Schedule:', data);
//           setScheduleItem(data);
//         } else {
//           console.warn('❌ No weeklySchedule found');
//         }
//       } catch (error) {
//         console.error('❌ Error fetching schedule:', error.message);
//       }
//     };

//     fetchSchedule();
//   }, [grade, section]);

//   useEffect(() => {
//     if (!scheduleItem?.weeklySchedule) return;

//     const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const todayName = days[new Date().getDay()];
//     const today = todayName.trim().toLowerCase();

//     console.log('📅 [INFO] Today is:', todayName);
//     console.log('🗓️ [DEBUG] Weekly Schedule:', scheduleItem?.weeklySchedule);

//     const todaySchedule = scheduleItem.weeklySchedule.find(
//       (d) => d.day?.trim().toLowerCase() === today
//     );

//     console.log('📘 [INFO] Today’s Schedule for', todayName, ':', todaySchedule);

//     let todayPeriod = null;
//     if (todaySchedule?.periods?.length) {
//       todayPeriod = todaySchedule.periods.find((p) => p.facultyId === facultyId);
//     }

//     console.log('🎯 [INFO] Matching Period Found:', todayPeriod);

//     const smId =
//       typeof todayPeriod?.subjectMasterId === 'object'
//         ? todayPeriod.subjectMasterId._id
//         : todayPeriod?.subjectMasterId;

//     const subName =
//       typeof todayPeriod?.subjectMasterId === 'object'
//         ? todayPeriod.subjectMasterId.name
//         : 'Unknown';

//     setSubjectMasterId(smId);
//     setSubjectName(subName);

//     console.log('✅ [INFO] subjectMasterId:', smId);
//     console.log('✅ [INFO] subjectName:', subName);
//   }, [scheduleItem]);

//   useFocusEffect(
//     React.useCallback(() => {
//       const onBack = () => {
//         if (redirectedFromHome) {
//           console.log('🔙 [INFO] Redirected from Home, navigating to FacultyTabs → Home');
//           navigation.navigate('FacultyTabs', {
//             screen: 'Home',
//             params: { userId: facultyId, grades: [grade] },
//           });
//           return true;
//         }
//         console.log('🔙 [INFO] Going back to previous screen');
//         navigation.goBack();
//         return true;
//       };
//       const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
//       return () => sub.remove();
//     }, [redirectedFromHome])
//   );

//   useLayoutEffect(() => {
//     navigation.setOptions({ title: `${grade}'th  Class - section ${section}` });
//   }, [navigation, grade]);

//   const sections = [
//     { title: 'Students', icon: 'people', screen: 'FacultyStudentsScreen' },
//     { title: 'Attendance', icon: 'clipboard', screen: 'FacultyAttendanceScreen' },
//     { title: 'Performance', icon: 'bar-chart', screen: 'FacultyPerformanceScreen' },
//     { title: 'My Schedule', icon: 'calendar', screen: 'FacultyScheduleScreen' },
//     { title: 'View Past Attendance', icon: 'time', screen: 'PastAttendanceScreen' },
//     { title: 'Monthly Summary', icon: 'stats-chart', screen: 'MonthlySummaryScreen' },
//     { title: 'Lecture Recording', icon: 'mic', screen: 'LectureRecordingScreen' },
//     { title: 'Chapters', icon: 'book', screen: 'FacultyChaptersScreen' },
//   ];

//   const handleCardPress = (screen) => {
//     console.log('🧭 [ACTION] Navigating to:', screen);
//     console.log('➡️ [DEBUG] Navigation Params →', {
//       grade,
//       section,
//       facultyId,
//       subjectMasterId,
//       subjectName,
//     });

//     navigation.navigate(screen, {
//       grade,
//       section,
//       facultyId,
//       subjectMasterId,
//       subjectName,
//     });
//   };

//   return (
//     <View style={styles.container}>
//       {sections.map((sec) => (
//         <TouchableOpacity
//           key={sec.title}
//           onPress={() => handleCardPress(sec.screen)}
//           style={styles.card}
//         >
//           <Ionicons name={sec.icon} size={32} color="#070000ff" style={{ marginBottom: 8 }} />
//           <Text style={styles.cardTitle}>{sec.title}</Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#bbdbfaff',
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   card: {
//     backgroundColor: '#fafafaff',
//     width: '47%',
//     paddingVertical: 24,
//     borderRadius: 12,
//     marginBottom: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cardTitle: {
//     color: '#000000ff',
//     fontSize: 14,
//     fontWeight: '500',
//     textAlign: 'center',
//   },
// });








//src/screens/Faculty/classes/FacultyClassDashboard.js
import React, { useLayoutEffect, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  BackHandler,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BASE_URL } from '@env';

export default function FacultyClassDashboard({ navigation, route }) {
  // Get all params with proper fallbacks
  const { 
    grade, 
    section, 
    facultyId, 
    subjectName, 
    subjectId,
    redirectedFromHome,
    scheduleItem 
  } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [classInfo, setClassInfo] = useState(null);

  // Debug: Check what params we're receiving
  useEffect(() => {
    console.log('📱 FacultyClassDashboard - Received Params:', {
      grade,
      section,
      facultyId,
      subjectName,
      subjectId,
      redirectedFromHome
    });

    if (!grade || !section) {
      Alert.alert('Error', 'Class information missing. Please go back and try again.');
      return;
    }
  }, [route.params]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: `Class ${grade} - Section ${section}` 
    });
  }, [navigation, grade, section]);

  // Simplified data fetching - remove complex schedule logic if not needed
  useEffect(() => {
    const initializeClassData = async () => {
      if (!grade || !section) return;

      setLoading(true);
      try {
        // Option 1: If you need schedule data
        if (!scheduleItem) {
          const response = await fetch(
            `${BASE_URL}/api/schedule/class/${grade}/section/${section}`
          );
          const data = await response.json();
          console.log('📦 Schedule Data:', data);
          setClassInfo(data);
        } else {
          setClassInfo(scheduleItem);
        }
      } catch (error) {
        console.error('❌ Error fetching class data:', error);
        // Continue even if schedule fails - not critical for dashboard
      } finally {
        setLoading(false);
      }
    };

    initializeClassData();
  }, [grade, section, scheduleItem]);

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        if (redirectedFromHome) {
          navigation.navigate('FacultyTabs', {
            screen: 'Home',
          });
          return true;
        }
        navigation.goBack();
        return true;
      };
      
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [redirectedFromHome, navigation])
  );

  const sections = [
    { 
      title: 'Students', 
      icon: 'people', 
      screen: 'FacultyStudentsScreen',
      requiredParams: ['grade', 'section', 'facultyId']
    },
    { 
      title: 'Attendance', 
      icon: 'clipboard', 
      screen: 'FacultyAttendanceScreen',
      requiredParams: ['grade', 'section', 'subjectId', 'subjectName']
    },
    { 
      title: 'Performance', 
      icon: 'bar-chart', 
      screen: 'FacultyPerformanceScreen',
      requiredParams: ['grade', 'section', 'subjectId']
    },
    { 
      title: 'Assignments', 
      icon: 'document-text', 
      screen: 'FacultyAssignmentsScreen',
      requiredParams: ['grade', 'section', 'subjectId']
    },
    { 
      title: 'Tests', 
      icon: 'school', 
      screen: 'FacultyTestsScreen',
      requiredParams: ['grade', 'section', 'subjectId']
    },
    { 
      title: 'My Schedule', 
      icon: 'calendar', 
      screen: 'FacultyScheduleScreen',
      requiredParams: ['facultyId']
    },
    { 
      title: 'Lecture Recording', 
      icon: 'videocam', 
      screen: 'LectureRecordingScreen',
      requiredParams: ['grade', 'section', 'subjectId']
    },
    { 
      title: 'Chapters', 
      icon: 'book', 
      screen: 'FacultyChaptersScreen',
      requiredParams: ['grade', 'section', 'subjectId']
    },
  ];

  const handleCardPress = (screen, requiredParams) => {
    console.log('🧭 Navigating to:', screen);
    
    // Check if we have all required parameters
    const missingParams = requiredParams.filter(param => !route.params[param]);
    if (missingParams.length > 0) {
      Alert.alert(
        'Information Missing', 
        `Cannot open ${screen}. Missing: ${missingParams.join(', ')}`
      );
      return;
    }

    // Prepare navigation params
    const navParams = {
      grade,
      section,
      facultyId: facultyId || user?.userId,
      subjectId,
      subjectName,
      ...route.params
    };

    console.log('➡️ Navigation Params:', navParams);

    navigation.navigate(screen, navParams);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4b4bfa" />
        <Text style={styles.loadingText}>Loading Class Dashboard...</Text>
      </View>
    );
  }

  if (!grade || !section) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Class information not available</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Class Header Info */}
      <View style={styles.header}>
        <Text style={styles.classTitle}>
          Class {grade} - Section {section}
        </Text>
        {subjectName && (
          <Text style={styles.subjectTitle}>
            Subject: {subjectName}
          </Text>
        )}
      </View>

      {/* Action Cards */}
      <View style={styles.cardsContainer}>
        {sections.map((sec) => (
          <TouchableOpacity
            key={sec.title}
            onPress={() => handleCardPress(sec.screen, sec.requiredParams)}
            style={styles.card}
          >
            <Ionicons name={sec.icon} size={32} color="#4b4bfa" style={{ marginBottom: 8 }} />
            <Text style={styles.cardTitle}>{sec.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bbdbfaff',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#bbdbfaff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4b4bfa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    backgroundColor: '#e3e9ff',
    marginBottom: 10,
  },
  classTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  subjectTitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    backgroundColor: '#fafafa',
    width: '47%',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});


