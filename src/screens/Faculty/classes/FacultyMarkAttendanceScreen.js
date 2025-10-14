// //src/screens/Faculty/classes/FacultyAttendanceScreen.js


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   StyleSheet,
//   Text,
//   TextInput,
//   StatusBar,
// } from 'react-native';
// import axios from 'axios';
// import { BASE_URL } from '@env';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useNavigation } from '@react-navigation/native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function FacultyAttendanceScreen({ route }) {
//   const { grade, section, subjectMasterId, facultyId } = route.params;
//   const [students, setStudents] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [summary, setSummary] = useState(null);

//   const navigation = useNavigation();

//   const filteredStudents = students.filter(student =>
//     student.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const today = new Date().toLocaleDateString('en-US', {
//     weekday: 'long',
//     month: 'long',
//     day: 'numeric',
//     year: 'numeric',
//   });

//   useEffect(() => {
//     loadStudents();
//   }, []);

//   const loadStudents = async () => {
//     try {
//       const { data } = await axios.get(
//         `${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`
//       );
//       setStudents(data);
//     } catch (err) {
//       console.error('Error loading students:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleStatus = id =>
//     setAttendance(prev => ({
//       ...prev,
//       [id]: prev[id] === 'Present' ? 'Absent' : 'Present',
//     }));

//   const handleSubmit = async () => {
//     if (!subjectMasterId) {
//       return Alert.alert(
//         'Error',
//         'No subject assigned to you today for this class/section.'
//       );
//     }

//     setSubmitting(true);
//     const date = new Date().toISOString().split('T')[0];
//     const token = await AsyncStorage.getItem('token');

//     const payload = {
//       classAssigned: grade,
//       section,
//       subjectMasterId,
//       facultyId,
//       date,
//       attendanceList: students.map(s => ({
//         userId: s.userId,
//         status: attendance[s._id] ?? 'Absent',
//       })),
//     };

//     try {
//       await axios.post(`${BASE_URL}/api/attendance/mark`, payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const presentCount = payload.attendanceList.filter(
//         entry => entry.status === 'Present'
//       ).length;
//       const totalCount = payload.attendanceList.length;
//       const absentCount = totalCount - presentCount;

//       setSummary({ present: presentCount, absent: absentCount });

//       Alert.alert('Success', 'Attendance marked successfully!');
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message;
//       console.error('🔴 Error marking attendance:', msg);
//       Alert.alert('Error', msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading)
//     return (
//       <ActivityIndicator style={{ flex: 1 }} size="large" color="#4a90e2" />
//     );

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
//       <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />

//       {/* 🟦 Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerText}>📋 Attendance for Today</Text>
//         <Text style={styles.dateText}>{today}</Text>
//       </View>

//       <TextInput
//         placeholder="Search students..."
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//         style={styles.searchBar}
//       />

//       <FlatList
//         data={filteredStudents}
//         keyExtractor={i => i._id}
//         renderItem={({ item }) => {
//           const status = attendance[item._id] || 'Absent';
//           return (
//             <TouchableOpacity
//               onPress={() => toggleStatus(item._id)}
//               style={[
//                 styles.card,
//                 status === 'Present' ? styles.present : styles.absent,
//               ]}
//             >
//               <Text style={styles.name}>{item.name}</Text>
//               <Text style={styles.status}>{status}</Text>
//             </TouchableOpacity>
//           );
//         }}
//         contentContainerStyle={styles.listContent}
//       />

//       <TouchableOpacity
//         style={styles.submitButton}
//         onPress={handleSubmit}
//         disabled={submitting}
//       >
//         <Text style={styles.submitText}>
//           {submitting ? 'Submitting...' : 'Submit Attendance'}
//         </Text>
//       </TouchableOpacity>

//       {summary && (
//         <View style={styles.summaryContainer}>
//           <Text style={styles.summaryText}>
//             🟢 Present: {summary?.present ?? 0} | 🔴 Absent:{' '}
//             {summary?.absent ?? 0}
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#bbdbfaff',
//   },
//   header: {
//     paddingVertical: 5,
//     backgroundColor: '#4a90e2',
//     alignItems: 'center',
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//   },
//   headerText: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   dateText: {
//     fontSize: 14,
//     color: '#e0e0ff',
//     marginTop: 4,
//   },
//   searchBar: {
//     padding: 12,
//     marginHorizontal: 16,
//     marginTop: 16,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     backgroundColor: '#fff',
//   },
//   listContent: {
//     padding: 15,
//   },
//   card: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   present: {
//     borderLeftWidth: 6,
//     borderLeftColor: '#4caf50',
//   },
//   absent: {
//     borderLeftWidth: 6,
//     borderLeftColor: '#f44336',
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   status: {
//     fontSize: 14,
//     marginTop: 5,
//     color: '#555',
//   },
//   submitButton: {
//     backgroundColor: '#4a90e2',
//     padding: 16,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginHorizontal: 16,
//     marginTop: 16,
//     marginBottom: 10,
//   },
//   submitText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   summaryContainer: {
//     marginHorizontal: 16,
//     marginBottom: 20,
//     padding: 12,
//     backgroundColor: '#eef6ff',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   summaryText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
// });



// src/screens/Faculty/classes/FacultyMarkAttendanceScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';

export default function FacultyMarkAttendanceScreen({ route }) {
  const { grade, section, subjectMasterId, facultyId, subjectName, subjectId } = route.params || {};
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState(null);
  const [validSubject, setValidSubject] = useState(null);
  const [currentSession, setCurrentSession] = useState(1);

  const navigation = useNavigation();
  const { decodedToken } = useAuth();

  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditPress = () => {
    navigation.navigate('FacultyEditAttendanceScreen', {
      grade, 
      section, 
      subjectName, 
      subjectId, 
      facultyId: decodedToken?.userId
    });
  };

  useEffect(() => {
    console.log('📱 FacultyMarkAttendanceScreen - Received Params:', {
      grade, section, subjectMasterId, facultyId: decodedToken?.userId, subjectName, subjectId
    });
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  useEffect(() => {
    loadStudents();
    verifyFacultyAssignment();
  }, []);

  const verifyFacultyAssignment = async () => {
    try {
      console.log('🔍 Verifying faculty assignment...');
      const currentFacultyId = decodedToken?.userId || facultyId;
      
      const response = await axios.get(
        `${BASE_URL}/api/subject/subjects/faculty/${currentFacultyId}`
      );
      
      console.log('📚 Faculty assigned subjects:', response.data);
      
      const assignedSubjects = response.data || [];
      const validAssignment = assignedSubjects.find(subject => {
        const subjectMatch = subject._id === subjectMasterId || 
                           subject.subjectId === subjectMasterId ||
                           subject._id === subjectId;
        
        if (subjectMatch && subject.classSectionAssignments) {
          return subject.classSectionAssignments.some(assignment => 
            assignment.classAssigned === grade && assignment.section === section
          );
        }
        return false;
      });

      if (validAssignment) {
        console.log('✅ Faculty assignment verified:', validAssignment);
        setValidSubject(validAssignment);
      } else {
        console.log('❌ Faculty not assigned to this subject/class/section');
        Alert.alert(
          'Access Denied',
          `You are not assigned to teach ${subjectName || 'this subject'} in Class ${grade}, Section ${section}.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('❌ Error verifying faculty assignment:', error);
    }
  };

  const loadStudents = async () => {
    try {
      console.log('📋 Loading students for:', { grade, section });
      const { data } = await axios.get(
        `${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`
      );
      console.log('👥 Students loaded:', data.length);
      setStudents(data);

      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student._id] = {
          session1: 'present',
          session2: 'absent'
        };
      });
      setAttendance(initialAttendance);
    } catch (err) {
      console.error('❌ Error loading students:', err);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [`session${currentSession}`]: 
          prev[studentId]?.[`session${currentSession}`] === 'present' ? 'absent' : 'present'
      }
    }));
  };

  const switchSession = (sessionNumber) => {
    setCurrentSession(sessionNumber);
    setSummary(null);
  };

  const getPresentCount = () => {
    return students.filter(student => 
      attendance[student._id]?.[`session${currentSession}`] === 'present'
    ).length;
  };

  const getAbsentCount = () => {
    return students.filter(student => 
      attendance[student._id]?.[`session${currentSession}`] === 'absent'
    ).length;
  };

  const handleSubmit = async () => {
    const currentFacultyId = decodedToken?.userId || facultyId;
    
    if (!currentFacultyId) {
      Alert.alert('Error', 'Faculty ID not found. Please login again.');
      return;
    }

    if (students.length === 0) {
      Alert.alert('Error', 'No students found for this class');
      return;
    }

    setSubmitting(true);
    const date = new Date().toISOString().split('T')[0];
    
    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        return;
      }

      const records = students.map(student => ({
        studentId: student.userId,
        status: attendance[student._id]?.[`session${currentSession}`] || 'absent'
      }));

      const payload = {
        grade: grade,
        section: section,
        date: date,
        sessionNumber: currentSession,
        markedBy: currentFacultyId,
        records: records,
        force: false
      };

      console.log('📤 Sending attendance payload:', payload);

      const response = await axios.post(`${BASE_URL}/api/attendance/mark`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.status === 409) {
        Alert.alert(
          "Attendance Already Marked",
          `Session ${currentSession} attendance is already marked for today.\n\nUse the "Edit" button to modify existing attendance.`,
          [
            { 
              text: "Edit Attendance", 
              onPress: handleEditPress
            },
            { 
              text: "OK", 
              style: "cancel"
            }
          ]
        );
        return;
      }

      console.log('✅ Attendance response:', response.data);
      
      const presentCount = getPresentCount();
      const absentCount = getAbsentCount();

      setSummary({ present: presentCount, absent: absentCount });

      Alert.alert(
        'Success', 
        `Session ${currentSession} attendance marked successfully!\nPresent: ${presentCount}, Absent: ${absentCount}`,
        [
          { 
            text: 'OK',
            onPress: () => {
              if (currentSession === 1) {
                // Don't auto-switch, let user decide
              }
            }
          }
        ]
      );

    } catch (err) {
      console.error('🔴 Error marking attendance:', err);
      
      let errorMessage = 'Failed to mark attendance';
      
      if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to mark attendance for this subject.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Faculty or students not found.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network connection failed. Please check your internet.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
      
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
          <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity onPress={handleBackPress} style={styles.backButtonContainer}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditPress} style={styles.editButtonContainer}>
                <Ionicons name="create-outline" size={20} color="#fff" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerText}>📋 Mark Attendance</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4a90e2" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />

        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEditPress} style={styles.editButtonContainer}>
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerText}>📋 Mark Attendance</Text>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.classInfo}>
            Class {grade} - Section {section}
            {subjectName && ` | ${subjectName}`}
          </Text>
          
          <View style={styles.sessionSelector}>
            <TouchableOpacity 
              onPress={() => switchSession(1)}
              style={[styles.sessionTab, currentSession === 1 && styles.activeSession]}
            >
              <Text style={[styles.sessionTabText, currentSession === 1 && styles.activeSessionText]}>
                Session 1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => switchSession(2)}
              style={[styles.sessionTab, currentSession === 2 && styles.activeSession]}
            >
              <Text style={[styles.sessionTabText, currentSession === 2 && styles.activeSessionText]}>
                Session 2
              </Text>
            </TouchableOpacity>
          </View>
          
          {validSubject ? (
            <View style={styles.authorizedContainer}>
              <Text style={styles.authorizedText}>✅ Authorized to mark attendance</Text>
            </View>
          ) : (
            <View style={styles.unauthorizedContainer}>
              <Text style={styles.unauthorizedText}>⚠️ Verifying authorization...</Text>
            </View>
          )}
          
          <View style={styles.liveSummary}>
            <Text style={styles.liveSummaryText}>
              Session {currentSession}: 🟢 Present: {getPresentCount()} | 🔴 Absent: {getAbsentCount()} | Total: {students.length}
            </Text>
          </View>
        </View>

        <TextInput
          placeholder="Search students by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        <FlatList
          data={filteredStudents}
          keyExtractor={item => item._id}
          renderItem={({ item }) => {
            const sessionStatus = attendance[item._id]?.[`session${currentSession}`] || 'absent';
            const isPresent = sessionStatus === 'present';
            
            return (
              <TouchableOpacity
                onPress={() => toggleStatus(item._id)}
                style={[styles.card, isPresent ? styles.present : styles.absent]}
              >
                <View style={styles.studentInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.userId}>ID: {item.userId}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <Text style={[styles.status, isPresent ? styles.statusPresent : styles.statusAbsent]}>
                    {isPresent ? 'Present' : 'Absent'}
                  </Text>
                  <View style={styles.sessionIndicators}>
                    <View style={[styles.sessionDot, attendance[item._id]?.session1 === 'present' ? styles.presentDot : styles.absentDot]} />
                    <View style={[styles.sessionDot, attendance[item._id]?.session2 === 'present' ? styles.presentDot : styles.absentDot]} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No students found</Text>
              <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (submitting || !validSubject) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || !validSubject}
          >
            <Text style={styles.submitText}>
              {!validSubject ? 'Not Authorized' : 
               submitting ? 'Submitting...' : `Submit Session ${currentSession} (${getPresentCount()}/${students.length})`}
            </Text>
          </TouchableOpacity>

          {summary && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                ✅ Submitted: 🟢 {summary.present} | 🔴 {summary.absent}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#bbdbfaff' },
  header: {
    paddingVertical: 15, backgroundColor: '#4a90e2', borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
    paddingHorizontal: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  headerTopRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  backButtonContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  editButtonContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  backButtonText: { 
    color: '#fff', 
    marginLeft: 5, 
    fontSize: 16, 
    fontWeight: '600' 
  },
  editButtonText: { 
    color: '#fff', 
    marginLeft: 5, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  backButton: { 
    backgroundColor: '#4b4bfa', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  dateText: { fontSize: 14, color: '#e0e0ff', marginTop: 4, textAlign: 'center' },
  classInfo: { fontSize: 14, color: '#e0e0ff', marginTop: 4, textAlign: 'center', fontStyle: 'italic' },
  sessionSelector: { flexDirection: 'row', marginTop: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 4 },
  sessionTab: { flex: 1, padding: 8, alignItems: 'center', borderRadius: 6 },
  activeSession: { backgroundColor: '#fff' },
  sessionTabText: { fontWeight: '600', color: '#fff' },
  activeSessionText: { color: '#4a90e2' },
  liveSummary: { marginTop: 8, padding: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  liveSummaryText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  sessionIndicators: { flexDirection: 'row', marginTop: 4 },
  sessionDot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 1 },
  presentDot: { backgroundColor: '#4caf50' },
  absentDot: { backgroundColor: '#f44336' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  searchBar: { padding: 12, marginHorizontal: 16, marginTop: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', fontSize: 16 },
  listContent: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', elevation: 3, shadowColor: '#000',
    shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  present: { borderLeftWidth: 6, borderLeftColor: '#4caf50' },
  absent: { borderLeftWidth: 6, borderLeftColor: '#f44336' },
  studentInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userId: { fontSize: 12, color: '#666', marginTop: 2 },
  statusContainer: { alignItems: 'center' },
  status: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  statusPresent: { color: '#4caf50' },
  statusAbsent: { color: '#f44336' },
  emptyContainer: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#bbdbfaff', padding: 16, borderTopWidth: 1, borderTopColor: '#ddd' },
  submitButton: { backgroundColor: '#4a90e2', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  submitButtonDisabled: { backgroundColor: '#a0a0a0' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  summaryContainer: { marginTop: 12, padding: 12, backgroundColor: '#e8f5e8', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#4caf50' },
  summaryText: { fontSize: 14, fontWeight: '600', color: '#2e7d32' },
  authorizedContainer: { marginTop: 6, padding: 4, backgroundColor: 'rgba(76, 175, 80, 0.2)', borderRadius: 6 },
  authorizedText: { fontSize: 12, color: '#4caf50', fontWeight: '600' },
  unauthorizedContainer: { marginTop: 6, padding: 4, backgroundColor: 'rgba(255, 152, 0, 0.2)', borderRadius: 6 },
  unauthorizedText: { fontSize: 12, color: '#ff9800', fontWeight: '600' },
});