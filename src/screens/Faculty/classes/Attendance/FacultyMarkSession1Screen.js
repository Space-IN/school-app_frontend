import { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../../api/api';

// HARDCODED SESSION NUMBER - This screen ONLY handles Session 1
const SESSION_NUMBER = 1;

export default function FacultyMarkSession1Screen({ route }) {
  const { 
    grade, 
    section, 
    subjectMasterId, 
    facultyId, 
    subjectName, 
    subjectId,
    board
  } = route.params || {};

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [validSubject, setValidSubject] = useState(null);

  const navigation = useNavigation();
  const { decodedToken } = useAuth();
  const insets = useSafeAreaInsets();

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

  const handleBackPress = () => {
    if (submitting) {
      Alert.alert(
        'Submission in Progress',
        'Attendance submission is in progress. Please wait.',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.goBack();
  };

  const verifyFacultyAssignment = async () => {
    try {
      console.log('🔍 [Session 1] Verifying faculty assignment...');
      const currentFacultyId = decodedToken?.preferred_username|| facultyId;
      
      const response = await api.get(
        `/api/faculty/subject/subjects/faculty/${currentFacultyId}`
      );
      
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
        setValidSubject(validAssignment);
      } else {
        Alert.alert(
          'Access Denied',
          `You are not assigned to teach ${subjectName || 'this subject'} in Class ${grade}, Section ${section}.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error(' [Session 1] Error verifying faculty assignment:', error);
    }
  };

  const loadStudents = async () => {
    try {
      console.log('[Session 1] Loading students...');
      const { data } = await api.get(
        `/api/faculty/students/grade/${grade}/section/${section}`,
        { params: { board, } }
      );
      setStudents(data);

      // Initialize all students as present
      const initialAttendance = {};
      data.forEach(student => {
        initialAttendance[student._id] = 'present';
      });
      setAttendance(initialAttendance);
      console.log(' [Session 1] Students loaded:', data.length);
    } catch (err) {
      console.error(' [Session 1] Error loading students:', err);
      Alert.alert('Error', 'Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    if (submitting) return;
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
    }));
  };

  const getPresentCount = () => {
    return students.filter(student => 
      attendance[student._id] === 'present'
    ).length;
  };

  const getAbsentCount = () => {
    return students.filter(student => 
      attendance[student._id] === 'absent'
    ).length;
  };

  const validateAndPrepareRecords = () => {
    const records = students.map(student => ({
      studentId: student.userId,
      status: attendance[student._id] || 'absent'
    }));

    // Remove duplicates
    const uniqueRecords = records.filter((record, index, self) => 
      index === self.findIndex(r => r.studentId === record.studentId)
    );

    return uniqueRecords;
  };

  const handleSubmit = async (retryCount = 0) => {
    if (submitting) {
      console.log(' [Session 1] Submission already in progress');
      return;
    }

    const currentFacultyId = decodedToken?.preferred_username || facultyId;
    
    if (!currentFacultyId) {
      Alert.alert('Error', 'Faculty ID not found. Please login again.');
      return;
    }

    if (students.length === 0) {
      Alert.alert('Error', 'No students found for this class');
      return;
    }

    console.log(` [Session 1] Starting attendance submission...`);
    setSubmitting(true);

    const date = new Date().toISOString().split('T')[0];
    
    try {
       


      const records = validateAndPrepareRecords();
      console.log(' [Session 1] Validated records:', records);
      console.log("board: ", board)

      const payload = {
        grade: Number(grade),
        section: section,
        board: board,
        date: date,
        sessionNumber: SESSION_NUMBER, // HARDCODED - Always 1
        markedBy: currentFacultyId,
        records: records,
        force: false
      };

      console.log(' [Session 1] Sending attendance payload:', JSON.stringify(payload, null, 2));

      const response = await  api.post(`/api/faculty/attendance/mark`, payload);

      console.log(' [Session 1] Attendance marked successfully');
      
      const presentCount = getPresentCount();
      const absentCount = getAbsentCount();

      Alert.alert(
        'Success ', 
        `Session 1 attendance marked successfully!\n\nPresent: ${presentCount}\nAbsent: ${absentCount}\nTotal: ${students.length}`,
        [
          { 
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (err) {
      console.error(' [Session 1] Submission error:', err);
      
      let errorMessage = 'Failed to mark attendance. Please try again.';
      let canRetry = false;
      
      if (err.response?.status === 409) {
        Alert.alert(
          "Already Marked",
          `Session 1 attendance is already marked for today.\n\nWould you like to go back to the menu?`,
          [
            { 
              text: "Go Back", 
              onPress: () => navigation.goBack()
            },
            { 
              text: "Stay",
              style: "cancel"
            }
          ]
        );
        return;
      }
      
      if (err.response?.status === 403) {
        errorMessage = 'You are not authorized to mark attendance for this subject.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Faculty or students not found. Please check your connection.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message === 'Network Error' || err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
        canRetry = true;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. The server is taking too long to respond.';
        canRetry = true;
      } else if (err.message === 'Authentication token not found') {
        errorMessage = 'Your session has expired. Please login again.';
      }

      const buttons = [{ text: 'OK' }];
      
      if (canRetry && retryCount < 2) {
        buttons.unshift({
          text: 'Retry',
          onPress: () => handleSubmit(retryCount + 1)
        });
      }

      Alert.alert(
        'Submission Failed', 
        canRetry && retryCount < 2 
          ? `${errorMessage}\n\nAttempt ${retryCount + 1} of 3`
          : errorMessage,
        buttons
      );

    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />
          <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>📋 Mark Attendance - Session 1</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c01e12ff" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />

        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <TouchableOpacity 
            onPress={handleBackPress} 
            style={[styles.backButtonContainer, submitting && styles.disabledButton]}
            disabled={submitting}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerText}>📋 Mark Attendance - Session 1</Text>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.classInfo}>
            Class {grade} - Section {section}
            {subjectName && ` | ${subjectName}`}
          </Text>
          
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
              🟢 Present: {getPresentCount()} | 🔴 Absent: {getAbsentCount()} | Total: {students.length}
              {submitting && ' | Submitting...'}
            </Text>
          </View>
        </View>

        <TextInput
          placeholder="Search students by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchBar, submitting && styles.disabledInput]}
          editable={!submitting}
        />

        <FlatList
          data={filteredStudents}
          keyExtractor={item => item._id}
          renderItem={({ item }) => {
            const isPresent = attendance[item._id] === 'present';
            
            return (
              <TouchableOpacity
                onPress={() => toggleStatus(item._id)}
                style={[
                  styles.card, 
                  isPresent ? styles.present : styles.absent,
                  submitting && styles.disabledCard
                ]}
                disabled={submitting}
              >
                <View style={styles.studentInfo}>
                  <Text style={[styles.name, submitting && styles.disabledText]}>{item.name}</Text>
                  <Text style={[styles.preferred_username, submitting && styles.disabledText]}>ID: {item.userId}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.status, 
                    isPresent ? styles.statusPresent : styles.statusAbsent,
                    submitting && styles.disabledText
                  ]}>
                    {isPresent ? 'Present' : 'Absent'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No students found</Text>
              <TouchableOpacity 
                style={[styles.backButton, submitting && styles.disabledButton]} 
                onPress={handleBackPress}
                disabled={submitting}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton, 
              (submitting || !validSubject) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={submitting || !validSubject}
          >
            {submitting ? (
              <View style={styles.submittingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitText}>Submitting Session 1...</Text>
              </View>
            ) : (
              <Text style={styles.submitText}>
                {!validSubject 
                  ? 'Not Authorized' 
                  : `Submit Session 1 (${getPresentCount()}/${students.length})`
                }
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffffff' },
  header: {
    paddingVertical: 15, 
    backgroundColor: '#c01e12ff', 
    borderBottomLeftRadius: 15, 
    borderBottomRightRadius: 15,
    paddingHorizontal: 10, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 4,
  },
  backButtonContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    borderRadius: 8, 
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  disabledButton: { opacity: 0.6 },
  backButtonText: { color: '#fff', marginLeft: 5, fontSize: 16, fontWeight: '600' },
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
  liveSummary: { marginTop: 8, padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  liveSummaryText: { fontSize: 13, color: '#fff', fontWeight: '600', textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  searchBar: { 
    padding: 12, marginHorizontal: 16, marginTop: 16, borderRadius: 8, 
    borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', fontSize: 16 
  },
  disabledInput: { backgroundColor: '#f5f5f5', color: '#999' },
  listContent: { padding: 15, paddingBottom: 100 },
  card: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 15, marginBottom: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
  },
  disabledCard: { opacity: 0.6 },
  present: { borderLeftWidth: 6, borderLeftColor: '#4caf50' },
  absent: { borderLeftWidth: 6, borderLeftColor: '#f44336' },
  studentInfo: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userId: { fontSize: 12, color: '#666', marginTop: 2 },
  disabledText: { opacity: 0.6 },
  statusContainer: { alignItems: 'center' },
  status: { fontSize: 14, fontWeight: '600' },
  statusPresent: { color: '#4caf50' },
  statusAbsent: { color: '#f44336' },
  emptyContainer: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#fafafaff', padding: 16, 
    borderTopWidth: 1, borderTopColor: '#ddd' 
  },
  submitButton: { 
    backgroundColor: '#c01e12ff', padding: 16, borderRadius: 12, 
    alignItems: 'center', elevation: 4, shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 
  },
  submitButtonDisabled: { backgroundColor: '#a0a0a0' },
  submittingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  authorizedContainer: { 
    marginTop: 6, padding: 6, backgroundColor: 'rgba(76, 175, 80, 0.2)', 
    borderRadius: 6, alignSelf: 'center'
  },
  authorizedText: { fontSize: 12, color: '#4caf50', fontWeight: '600' },
  unauthorizedContainer: { 
    marginTop: 6, padding: 6, backgroundColor: 'rgba(255, 152, 0, 0.2)', 
    borderRadius: 6, alignSelf: 'center'
  },
  unauthorizedText: { fontSize: 12, color: '#ff9800', fontWeight: '600' },
});