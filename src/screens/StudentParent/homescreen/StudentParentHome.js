// // screens/StudentParent/homescreen/StudentParentHome.js
// import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Alert,
//   TouchableOpacity,
//   ScrollView,
//   useWindowDimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
// import ProfileHeader from '../../../components/ProfileHeader';
// import axios from 'axios';
// import PosterCarousel from '../../../components/PosterCarousel';
// import BASE_URL from '../../../config/baseURL';
// import { useAuth } from '../../../context/authContext';

// export default function StudentParentHome() {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const scrollRef = useRef(null);
//   const [subjects, setSubjects] = useState([]);
//   const [eventsToday, setEventsToday] = useState([]);

//   const params = route.params || {};
//   const { userId, userData } = params;
//   const { studentName, className, section } = userData || {};
//   const displayName = studentName || userId || 'User';
//   const { logout } = useAuth()

//   useLayoutEffect(() => {
//     navigation.setOptions({
//       title: 'Student/Parent Dashboard',
//       headerRight: () => (
//         <TouchableOpacity
//           onPress={() => {
//             Alert.alert('Logout', 'Are you sure you want to logout?', [
//               { text: 'Cancel', style: 'cancel' },
//               {
//                 text: 'Logout',
//                 style: 'destructive',
//                 onPress: () => {
//                   logout()
//                 },
//               },
//             ]);
//           }}
//           style={{
//             marginRight: 10,
//             paddingVertical: 6,
//             paddingHorizontal: 10,
//             backgroundColor: '#d9534f',
//             borderRadius: 6,
//           }}
//         >
//           <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Logout</Text>
//         </TouchableOpacity>
//       ),
//     });
//   }, [navigation]);

//   // 🟡 Scroll-to-top on tab press
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('tabPress', (e) => {
//       // prevent default only if already focused
//       if (navigation.isFocused()) {
//         scrollRef.current?.scrollTo({ y: 0, animated: true });
//       }
//     });
//     return unsubscribe;
//   }, [navigation]);

//   // 🟡 Fetch subjects
//   useEffect(() => {
//     const fetchSubjects = async () => {
//       if (!className || !section) {
//         console.warn('ClassName or section missing');
//         return;
//       }

//       try {
//         console.log(`Fetching subjects for ${className} / ${section}`);
//         const res = await axios.get(
//           `${BASE_URL}/api/schedule/subjects/${className}/${section}`
//         );
//         console.log('Subjects fetched:', res.data);

//         setSubjects(res.data.subjects || []);
//       } catch (err) {
//         console.error('Failed to load subjects:', err.response?.data || err.message);
//       }
//     };

//     fetchSubjects();
//   }, [className, section]);

//   // 🟡 Fetch today's events
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/events`);
//         const allEvents = res.data || [];
//         const today = new Date().toISOString().split('T')[0];

//         const filtered = allEvents.filter(
//           (event) => new Date(event.date).toISOString().split('T')[0] === today
//         );

//         setEventsToday(filtered);
//       } catch (err) {
//         console.error('Error fetching events:', err.message);
//       }
//     };

//     fetchEvents();
//   }, []);

//   return (
//     <ScrollView ref={scrollRef} style={styles.container}>
//       <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={() => {
//           console.log('✅ Tapped ProfileHeader');
//           navigation.navigate('StudentProfileScreen', { profile: userData  });
//         }}
//         style={{ flex: 1 }}
//       >
//         <View>
//           <ProfileHeader nameOrId={displayName} className={className} section={section} />
//         </View>
//       </TouchableOpacity>

//       <PosterCarousel />

//       <Text style={styles.sectionTitle}>My Subjects</Text>

//       <View style={styles.subjectGrid}>
//         {Array.isArray(subjects) && subjects.length > 0 ? (
//           subjects.map((item, index) => (
//             <TouchableOpacity
//               key={index}
//               style={[styles.subjectTile, { backgroundColor: item.color || '#ffffffff' }]}
//               activeOpacity={1}
//               onPress={() =>
//                 navigation.navigate('SubjectDashboard', {
//                   subjectName: item.name,
//                   subjectMasterId: item._id,
//                   grade: className,
//                   section: section,
//                   chapters: item.chapters || [],
//                   announcements: item.announcements || [],
//                 })
//               }
//             >
//               <Ionicons name={item.icon || 'book'} size={30} color="#4f46e5" />
//               <Text style={styles.subjectText}>{item.name}</Text>
//             </TouchableOpacity>
//           ))
//         ) : (
//           <Text style={{ padding: 12, color: '#999' }}>No subjects found.</Text>
//         )}
//       </View>

//       <View style={styles.eventContainer}>
//         <Text style={styles.eventHeader}>Today's Event</Text>
//         {eventsToday.length > 0 ? (
//           eventsToday.map((event, index) => (
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
//   container: { flex: 1, backgroundColor: '#bbdbfaff' },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginTop: 20,
//     paddingHorizontal: 12,
//     marginBottom: 10,
//   },
//   subjectGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     paddingHorizontal: 12,
//   },
//   subjectTile: {
//     width: '48%',
//     minHeight: 100,
//     marginBottom: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 15,
//   },
//   subjectText: {
//     marginTop: 8,
//     color: '#000000ff',
//     fontSize: 15,
//     fontWeight: '600',
//     textAlign: 'center',
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
//     color: '#000000ff',
//   },
//   eventBox: {
//     marginBottom: 10,
//   },
//   eventTitle: {
//     fontWeight: '600',
//     fontSize: 15,
//     color: '#0f172a',
//   },
//   eventDesc: {
//     color: '#334155',
//     fontSize: 14,
//   },
//   noEvent: {
//     color: '#6b7280',
//     fontSize: 14,
//   },
// });





import { ScrollView, StyleSheet, View } from "react-native";
import UserBanner from "../../../components/student/userBanner";
import PerformanceGrid from "../../../components/student/performaceGrid";
import StudentAnnoucements from "../../../components/student/announcements";
import TodaySchedule from "../../../components/student/todaySchedule";
import { useAuth } from "../../../context/authContext";

export default function StudentParentHome() {
  const { user } = useAuth()

  return (
    <ScrollView style={{ flex: 1, padding: 2, backgroundColor: "#F9FAFB" }}>
      <View style={styles.userBannerContainer}>
        <UserBanner />
      </View>
      
      <View style={styles.userPerformanceGrid}>
        <PerformanceGrid />
      </View>

      <View style={styles.announcementsContainer}>
        <StudentAnnoucements  />
      </View>

      <View style={styles.announcementsContainer}>
        <TodaySchedule userId={user?.userId} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  userBannerContainer: {
    width: "100%",
    height: 120,
  },
  userPerformanceGrid: {
    width: "100%",
    marginTop: 50,
  },
  announcementsContainer: {
    // backgroundColor: "white",
    height: "auto",
    padding: 2,
    marginBottom: 2
  }
})