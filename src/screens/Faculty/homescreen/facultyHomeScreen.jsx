// //src/screens/Faculty/homescreen/FacultyDashboard.js

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useScrollToTop } from '@react-navigation/native';
import { useAuth } from "../../../context/authContext";
import ProfileHeader from '../../../components/ProfileHeader';
import PosterCarousel from '../../../components/PosterCarousel';
import {BASE_URL} from '@env'
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   FlatList,
//   TouchableOpacity,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';
// import { useScrollToTop } from '@react-navigation/native';
// import { useAuth } from "../../../context/authContext";
// import ProfileHeader from '../../../components/ProfileHeader';
// import PosterCarousel from '../../../components/PosterCarousel';
// import {BASE_URL} from '@env'

// export default function FacultyDashboard({ navigation }) {
//   const [facultyInfo, setFacultyInfo] = useState(null);
//   const [subjects, setSubjects] = useState([]);
//   const [schedule, setSchedule] = useState([]);
//   const [events, setEvents] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const { user, logout } = useAuth();

//   const scrollRef = useRef(null);
//   useScrollToTop(scrollRef);

//   const handleLogout = () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: async () => {
//           logout();
//         },
//       },
//     ]);
//   };

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerRight: () => (
//         <TouchableOpacity
//           onPress={handleLogout}
//           style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center' }}
//         >
//           <Ionicons name="log-out-outline" size={20} color="#d9534f" />
//           <Text style={{ color: '#d9534f', marginLeft: 4, fontWeight: '600' }}>
//             Logout
//           </Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // Fetch all data
//   const fetchData = async () => {
//     if (!user?.userId) {
//       console.log("No user ID available");
//       return;
//     }

//     try {
//       setRefreshing(true);
//       await Promise.all([
//         fetchAssignedSubjects(user.userId),
//         fetchFacultySchedule(user.userId),
//         fetchEventsData(),
//       ]);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       // Set faculty info from auth context
//       setFacultyInfo({
//         userId: user.userId,
//         role: user.role,
//         name: user.name || user.userId // Use name if available, fallback to userId
//       });
      
//       fetchData();
//     }
//   }, [user]);

//   const fetchAssignedSubjects = async (facultyId) => {
//     try {
//       console.log('Fetching subjects for faculty:', facultyId);
//       const response = await axios.get(
//         `${BASE_URL}/api/subject/subjects/faculty/${facultyId}`
//       );
//       console.log('Subjects response:', response.data);
      
//       const rawSubjects = response.data || [];

//       // Handle different possible response structures
//       let flattenedSubjects = [];
//       if (Array.isArray(rawSubjects)) {
//         flattenedSubjects = rawSubjects.flatMap((subject) => {
//           // Check if classSectionAssignments exists and is an array
//           if (subject.classSectionAssignments && Array.isArray(subject.classSectionAssignments)) {
//             return subject.classSectionAssignments.map((assign) => ({
//               subjectId: subject._id || subject.subjectId,
//               subjectName: subject.subjectName || 'Unnamed Subject',
//               classAssigned: assign.classAssigned || 'N/A',
//               section: assign.section || 'N/A',
//             }));
//           } else {
//             // If no assignments, still include the subject
//             return [{
//               subjectId: subject._id || subject.subjectId,
//               subjectName: subject.subjectName || 'Unnamed Subject',
//               classAssigned: 'No class assigned',
//               section: 'No section',
//             }];
//           }
//         });
//       }

//       setSubjects(flattenedSubjects);
//     } catch (err) {
//       console.error('❌ Error fetching subjects:', err.message);
//       console.error('Error details:', err.response?.data);
//       setSubjects([]);
//     }
//   };

//   const fetchFacultySchedule = async (facultyId) => {
//     try {
//       console.log('Fetching schedule for faculty:', facultyId);
//       const response = await axios.get(`${BASE_URL}/api/schedule/faculty/${facultyId}`);
//       console.log('Schedule response:', response.data);
      
//       const fullSchedule = response.data?.schedule || response.data || [];

//       const todayName = new Date().toLocaleDateString('en-US', {
//         weekday: 'long',
//       });

//       console.log('Looking for schedule for:', todayName);

//       const todayScheduleRaw = fullSchedule.filter(
//         (dayObj) => dayObj.day === todayName
//       );

//       const todaySchedule = todayScheduleRaw.flatMap((dayObj) => {
//         if (dayObj.periods && Array.isArray(dayObj.periods)) {
//           return dayObj.periods.map((period) => ({
//             ...period,
//             classAssigned: dayObj.classAssigned || period.classAssigned,
//             section: dayObj.section || period.section,
//             day: dayObj.day,
//           }));
//         }
//         return [];
//       });

//       setSchedule(todaySchedule);
//     } catch (err) {
//       console.error('❌ Error fetching schedule:', err.message);
//       console.error('Error details:', err.response?.data);
//       setSchedule([]);
//     }
//   };

//   const fetchEventsData = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/events`);
//       setEvents(response.data || []);
//     } catch (err) {
//       console.error('Failed to fetch events:', err.message);
//       setEvents([]);
//     }
//   };

//   const onRefresh = () => {
//     fetchData();
//   };

//   const renderSubjectItem = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.subjectCard}
//       onPress={() => {
//         // Navigate to class dashboard when subject is pressed
//         navigation.navigate('Classes', { 
//           screen: 'FacultyClassDashboard',
//           params: {
//             classId: item.classAssigned,
//             section: item.section,
//             subjectId: item.subjectId,
//             subjectName: item.subjectName
//           }
//         });
//       }}
//     >
//       <Text style={styles.subjectName}>{item.subjectName}</Text>
//       <Text style={styles.subjectDetails}>
//         Class {item.classAssigned} - Section {item.section}
//       </Text>
//     </TouchableOpacity>
//   );

//   const renderScheduleItem = ({ item, index }) => (
//     <View key={index} style={styles.timelineItem}>
//       <View style={styles.timelineDot} />
//       <View style={styles.timelineContent}>
//         <Text style={styles.timelineTime}>
//           #{item.periodNumber} - {item.timeSlot}
//         </Text>
//         <Text style={styles.timelineClass}>
//           {item.classAssigned} {item.section} - {item.subjectMasterId?.name || 'Subject'}
//         </Text>
//       </View>
//     </View>
//   );

//   const today = new Date().toISOString().split('T')[0];
//   const todayEvents = events.filter((event) => {
//     const eventDate = new Date(event.date).toISOString().split('T')[0];
//     return eventDate === today;
//   });

//   if (!facultyInfo) {
//     return (
//       <View style={styles.container}>
//         <Text>Loading faculty dashboard...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       ref={scrollRef}
//       style={styles.container}
//       contentContainerStyle={{ paddingBottom: 60 }}
//       refreshControl={
//         <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//       }
//     >
//       <ProfileHeader
//         nameOrId={facultyInfo.name || facultyInfo.userId}
//         onPress={() => navigation.navigate('FacultyProfileScreen')}
//       />

//       <View style={{ marginVertical: 12, marginHorizontal: -20 }}>
//         <PosterCarousel />
//       </View>

//       <Text style={styles.sectionTitle}>My Subjects</Text>
//       {subjects.length === 0 ? (
//         <Text style={styles.noDataText}>No subjects assigned yet.</Text>
//       ) : (
//         <FlatList
//           data={subjects}
//           renderItem={renderSubjectItem}
//           keyExtractor={(item, index) => `${item.subjectId}-${index}`}
//           scrollEnabled={false}
//           contentContainerStyle={{ gap: 10, marginBottom: 20 }}
//         />
//       )}

//       <Text style={styles.sectionTitle}>Today's Schedule</Text>
//       {schedule.length === 0 ? (
//         <Text style={styles.noDataText}>No classes scheduled for today.</Text>
//       ) : (
//         <View style={styles.timelineContainer}>
//           <FlatList
//             data={schedule}
//             renderItem={renderScheduleItem}
//             keyExtractor={(item, index) => `schedule-${index}`}
//             scrollEnabled={false}
//           />
//         </View>
//       )}

//       <View style={styles.eventContainer}>
//         <Text style={styles.eventHeader}>Today's Events</Text>
//         {todayEvents.length > 0 ? (
//           todayEvents.map((event, index) => (
//             <View key={index} style={styles.eventBox}>
//               <Text style={styles.eventTitle}>{event.title}</Text>
//               <Text style={styles.eventDesc}>{event.description}</Text>
//             </View>
//           ))
//         ) : (
//           <Text style={styles.noEvent}>No events for today.</Text>
//         )}
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#bbdbfaff',
//     padding: 20,
//     paddingTop: 0,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginVertical: 12,
//     color: '#1e3a8a',
//   },
//   subjectCard: {
//     backgroundColor: '#e3e9ff',
//     padding: 14,
//     borderRadius: 10,
//     borderLeftWidth: 5,
//     borderLeftColor: '#4b4bfa',
//   },
//   subjectName: { 
//     fontSize: 16, 
//     fontWeight: '600', 
//     color: '#1e3a8a' 
//   },
//   subjectDetails: { 
//     fontSize: 14, 
//     color: '#555', 
//     marginTop: 4 
//   },
//   timelineContainer: {
//     marginTop: 10,
//     paddingLeft: 10,
//     borderLeftWidth: 2,
//     borderColor: '#4b4bfa',
//     paddingBottom: 30,
//   },
//   timelineItem: {
//     marginBottom: 14,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   timelineDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     backgroundColor: '#4b4bfa',
//     marginRight: 10,
//     marginTop: 4,
//   },
//   timelineContent: { 
//     marginLeft: 5 
//   },
//   timelineTime: { 
//     fontSize: 14, 
//     fontWeight: 'bold', 
//     color: '#1e3a8a' 
//   },
//   timelineClass: { 
//     fontSize: 14, 
//     color: '#333' 
//   },
//   eventContainer: {
//     marginTop: 25,
//     marginHorizontal: 12,
//     backgroundColor: '#e0f2fe',
//     padding: 15,
//     borderRadius: 12,
//     marginBottom: 40,
//   },
//   eventHeader: {
//     fontSize: 17,
//     fontWeight: 'bold',
//     marginBottom: 10,
//     color: '#1d4ed8',
//   },
//   eventBox: { 
//     marginBottom: 10 
//   },
//   eventTitle: { 
//     fontWeight: '600', 
//     fontSize: 15, 
//     color: '#0f172a' 
//   },
//   eventDesc: { 
//     color: '#334155', 
//     fontSize: 14 
//   },
//   noEvent: { 
//     color: '#6b7280', 
//     fontSize: 14 
//   },
//   noDataText: {
//     color: '#666',
//     marginBottom: 20,
//     fontStyle: 'italic',
//   },
// });
// src/screens/faculty/facultyHomeScreen.jsx
import { ScrollView, StyleSheet, View } from "react-native";
import FacultyBanner from "../../../components/faculty/facultyBanner";
import FacultyAnnouncements from "../../../components/faculty/facultyAnnouncements";
import FacultyTodaySchedule from "../../../components/faculty/facultyTodaySchedule";

export default function FacultyHomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.bannerContainer}>
        <FacultyBanner navigation={navigation} />
      </View>

      <View style={styles.announcementsContainer}>
        <FacultyAnnouncements />
      </View>

      <View style={styles.scheduleContainer}>
        <FacultyTodaySchedule />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
  },
  bannerContainer: {
    width: "100%",
    height: 120,
  },
  announcementsContainer: {
    width: "100%",
    marginTop: 20,
  },
  scheduleContainer: {
    width: "100%",
    marginTop: 20,
  },
});
