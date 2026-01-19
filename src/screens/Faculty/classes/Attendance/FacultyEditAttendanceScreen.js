// src/screens/Faculty/classes/FacultyEditAttendanceScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  StatusBar,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
 
import { BASE_URL } from '@env';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import {api} from '../../../../api/api';

export default function FacultyEditAttendanceScreen({ route }) {
  const { grade, section, subjectName, facultyId } = route.params || {};
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [students, setStudents] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editingAttendance, setEditingAttendance] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const navigation = useNavigation();
  const { decodedToken } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [filteredModalStudents, setFilteredModalStudents] = useState([]);


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButtonHeader}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonTextHeader}>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadStudents();
    loadAttendanceData(selectedDate);
  }, []);

  const loadStudents = async () => {
    try {
      const { data } = await api.get(
        `/api/faculty/students/grade/${grade}/section/${section}`
      );
      setStudents(data);
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  //used for the filter student in the modal
  useEffect(() => {
  if (modalSearchQuery.trim() === '') {
    setFilteredModalStudents(students);
  } else {
    const filtered = students.filter(student => {
      const query = modalSearchQuery.toLowerCase();
      const nameMatch = student.name?.toLowerCase().includes(query);
      const idMatch = student.userId?.toLowerCase().includes(query);
      return nameMatch || idMatch;
    });
    setFilteredModalStudents(filtered);
  }
}, [modalSearchQuery, students]);





const loadAttendanceData = async (date) => {
  try {
    setLoading(true);
    const dateStr = date.toISOString().split('T')[0];
    
    console.log(' Fetching attendance for:', { 
      grade, 
      section, 
      date: dateStr,
      url: `/api/faculty/attendance/edit`
    });
    
    const response = await api.get(`/api/faculty/attendance/edit`, {
      params: {
        grade: grade,        // ✅ FIXED: Changed from classAssigned
        section: section,
        date: dateStr
      }
    });
    
    console.log('📦 Full response:', JSON.stringify(response.data, null, 2));
    
    // Handle both response formats
    let attendanceArray;
    if (response.data.success && response.data.data) {
      attendanceArray = response.data.data;
    } else if (Array.isArray(response.data)) {
      attendanceArray = response.data;
    } else {
      attendanceArray = [];
    }
    
    if (attendanceArray.length > 0) {
      setAttendanceData(attendanceArray[0]);
      console.log('✅ Loaded attendance:', {
        date: attendanceArray[0].date,
        grade: attendanceArray[0].grade,
        section: attendanceArray[0].section,
        recordsCount: attendanceArray[0].records?.length || 0,
        sessions: attendanceArray[0].markedBy?.map(m => m.session) || []
      });
    } else {
      setAttendanceData(null);
      console.log('ℹ️ No attendance data found for date:', dateStr);
    }
  } catch (error) {
    console.error('❌ Error loading attendance data:', error);
    console.error('❌ Error response:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    
    setAttendanceData(null);
    
    if (error.response?.status !== 404) {
      Alert.alert('Error', `Failed to load attendance: ${error.response?.data?.message || error.message}`);
    } else {
      console.log('ℹ️ No attendance records found (404) for selected date');
    }
  } finally {
    setLoading(false);
  }
};










 const handleDateChange = (event, selectedDate) => {
  setShowDatePicker(false);
  if (selectedDate) {
    // Clear previous data immediately when date changes
    setAttendanceData(null);
    setSelectedDate(selectedDate);
    loadAttendanceData(selectedDate);
  }
};

const openEditModal = (sessionNumber) => {
  if (!attendanceData) {
    Alert.alert('No Data', 'No attendance data found for selected date');
    return;
  }

  setEditingSession(sessionNumber);
  setModalSearchQuery('');
  
  const editData = {};
  
  students.forEach(student => {
    // Find the student record with flexible handling for different API shapes
    const studentRecord = attendanceData.records?.find(record => {
      if (!record) return false;

      // Direct userId match (API sample uses `studentUserId`)
      if (record.studentUserId && student.userId && record.studentUserId === student.userId) return true;

      // Some APIs may use `studentId` field (could be userId or _id)
      if (record.studentId && student.userId && record.studentId === student.userId) return true;
      if (record.studentId && student._id && record.studentId === String(student._id)) return true;

      // Legacy / nested shapes under `student` field
      const recStudent = record.student;
      if (!recStudent) return false;

      // If `student` is a string (objectId or userId)
      if (typeof recStudent === 'string') {
        if (student._id && recStudent === String(student._id)) return true;
        if (student.userId && recStudent === student.userId) return true;
        return false;
      }

      // If `student` is an object
      if (typeof recStudent === 'object') {
        if (recStudent._id && student._id && String(recStudent._id) === String(student._id)) return true;
        if (recStudent.userId && student.userId && recStudent.userId === student.userId) return true;
        if (recStudent.student && student._id && String(recStudent.student) === String(student._id)) return true;
      }

      return false;
    });
    
    if (studentRecord) {
      const session = studentRecord.sessions?.find(s => s.session_number === sessionNumber);
      editData[student._id] = session ? session.status : 'absent';
    } else {
      // Student not in attendance records, default to absent
      editData[student._id] = 'absent';
    }
  });
  
  console.log('📝 Edit data prepared:', {
    sessionNumber,
    studentsCount: students.length,
    editDataCount: Object.keys(editData).length,
    sampleEditData: Object.entries(editData).slice(0, 3)
  });
  
  setEditingAttendance(editData);
  setEditModalVisible(true);
};










  const updateEditingAttendance = (studentId, status) => {
    setEditingAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const submitEdit = async () => {
    const currentFacultyId = decodedToken?.preferred_username || facultyId;
    
    if (!currentFacultyId) {
      Alert.alert('Error', 'Faculty ID not found');
      return;
    }

    setSubmitting(true);
    const date = selectedDate.toISOString().split('T')[0];
    
    try {
      

      const records = students.map(student => ({
        studentId: student.userId,
        status: editingAttendance[student._id] || 'absent'
      }));

      const payload = {
        grade: grade,
        section: section,
        date: date,
        sessionNumber: editingSession,
        markedBy: currentFacultyId,
        records: records,
        force: true // Always force for editing
      };

      console.log(' Sending edit payload:', payload);

      const response = await api.post(`/api/faculty/attendance/mark`, payload);

      console.log(' Edit response:', response.data);
      
      Alert.alert('Success', `Session ${editingSession} attendance updated successfully!`);
      
      // Reload data and close modal
      loadAttendanceData(selectedDate);
      setEditModalVisible(false);
      
    } catch (err) {
      console.error(' Error updating attendance:', err);
      Alert.alert('Error', 'Failed to update attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getSessionInfo = (sessionNumber) => {
    const marks = attendanceData?.markedBy || attendanceData?.marked_by || attendanceData?.markedby || [];
    if (!Array.isArray(marks) || marks.length === 0) return null;

    const sessionMark = marks.find(mark => mark.session === sessionNumber);
    return sessionMark || null;
  };

  // Precompute session info to avoid repeated lookups in JSX
  const session1Info = getSessionInfo(1);
  const session2Info = getSessionInfo(2);

  const getSessionStats = (sessionNumber) => {
    if (!attendanceData?.records) return { present: 0, absent: 0, total: 0 };
    
    let present = 0;
    let absent = 0;
    
    attendanceData.records.forEach(record => {
      const session = record.sessions.find(s => s.session_number === sessionNumber);
      if (session) {
        if (session.status === 'present') present++;
        else absent++;
      }
    });
    
    return { present, absent, total: present + absent };
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />

        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerText}>✏️ Edit Attendance</Text>
          <Text style={styles.classInfo}>
            Class {grade} - Section {section}
            {subjectName && ` | ${subjectName}`}
          </Text>
        </View>

        {/* Date Picker */}
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Select Date:</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#4a90e2" />
            <Text style={styles.dateButtonText}>{formatDate(selectedDate)}</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4a90e2" />
              <Text style={styles.loadingText}>Loading attendance data...</Text>
            </View>
          ) : attendanceData ? (
            <View style={styles.attendanceContainer}>
              <Text style={styles.sectionTitle}>Attendance for {formatDate(selectedDate)}</Text>
              
              {/* Session 1 Card */}
              <View style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Session 1</Text>
                  <View style={styles.sessionStats}>
                    <Text style={styles.statsText}>
                      🟢 {getSessionStats(1).present} | 🔴 {getSessionStats(1).absent}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sessionInfo}>
                  <Text style={styles.infoText}>
                    Marked by: {session1Info?.facultyName || session1Info?.name || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    Faculty ID: {session1Info?.facultyUserId || session1Info?.facultyId || session1Info?.faculty?.$oid || 'N/A'}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.editSessionButton}
                  onPress={() => openEditModal(1)}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.editSessionButtonText}>Edit Session 1</Text>
                </TouchableOpacity>
              </View>

              {/* Session 2 Card */}
              <View style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>Session 2</Text>
                  <View style={styles.sessionStats}>
                    <Text style={styles.statsText}>
                      🟢 {getSessionStats(2).present} | 🔴 {getSessionStats(2).absent}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sessionInfo}>
                  <Text style={styles.infoText}>
                    Marked by: {session2Info?.facultyName || session2Info?.name || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    Faculty ID: {session2Info?.facultyUserId || session2Info?.facultyId || session2Info?.faculty?.$oid || 'N/A'}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.editSessionButton}
                  onPress={() => openEditModal(2)}
                >
                  <Ionicons name="create-outline" size={18} color="#fff" />
                  <Text style={styles.editSessionButtonText}>Edit Session 2</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Ionicons name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.noDataText}>No attendance data found</Text>
              <Text style={styles.noDataSubText}>
                No attendance records found for {formatDate(selectedDate)}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Edit Modal */}
        {/* Edit Modal */}
<Modal
  visible={editModalVisible}
  animationType="slide"
  presentationStyle="pageSheet"
>
  <SafeAreaView style={styles.modalContainer}>
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>
        Edit Session {editingSession}
      </Text>
      <TouchableOpacity 
        onPress={() => setEditModalVisible(false)}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={24} color="#666" />
      </TouchableOpacity>
    </View>

    {/* Search Bar - NEW */}
    <View style={styles.modalSearchContainer}>
      <View style={styles.modalSearchInputContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.modalSearchIcon} />
        <TextInput
          style={styles.modalSearchInput}
          placeholder="Search student by name or ID..."
          placeholderTextColor="#999"
          value={modalSearchQuery}
          onChangeText={setModalSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {modalSearchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setModalSearchQuery('')} 
            style={styles.modalClearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {modalSearchQuery.length > 0 && (
        <Text style={styles.modalResultCount}>
          {filteredModalStudents.length} student{filteredModalStudents.length !== 1 ? 's' : ''} found
        </Text>
      )}
    </View>

    <FlatList
      data={filteredModalStudents}  
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => updateEditingAttendance(
            item._id, 
            editingAttendance[item._id] === 'present' ? 'absent' : 'present'
          )}
          style={[
            styles.editStudentCard,
            editingAttendance[item._id] === 'present' ? styles.editPresent : styles.editAbsent
          ]}
        >
          <View style={styles.editStudentInfo}>
            <Text style={styles.editStudentName}>{item.name}</Text>
            <Text style={styles.editStudentId}>ID: {item.userId}</Text>
          </View>
          <Text style={[
            styles.editStatus,
            editingAttendance[item._id] === 'present' ? styles.editStatusPresent : styles.editStatusAbsent
          ]}>
            {editingAttendance[item._id] === 'present' ? 'Present' : 'Absent'}
          </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.editListContent}
      ListEmptyComponent={
        modalSearchQuery.length > 0 ? (
          <View style={styles.modalEmptyContainer}>
            <Ionicons name="search-outline" size={48} color="#ccc" />
            <Text style={styles.modalEmptyText}>No students found</Text>
            <Text style={styles.modalEmptySubText}>
              Try searching with a different name or ID
            </Text>
          </View>
        ) : null
      }
    />

    <View style={styles.modalFooter}>
      <TouchableOpacity 
        style={[styles.submitEditButton, submitting && styles.submitEditButtonDisabled]}
        onPress={submitEdit}
        disabled={submitting}
      >
        <Text style={styles.submitEditText}>
          {submitting ? 'Updating...' : `Update Session ${editingSession}`}
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
</Modal>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fafcffff' },
  header: {
    paddingVertical: 15, backgroundColor: '#c01e12ff', borderBottomLeftRadius: 15, borderBottomRightRadius: 15,
    paddingHorizontal: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButtonContainer: { flexDirection: 'row', alignItems: 'center', padding: 5, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  backButtonHeader: { flexDirection: 'row', alignItems: 'center', marginLeft: 10, padding: 5 },
  backButtonTextHeader: { color: '#fff', marginLeft: 5, fontSize: 16, fontWeight: '600' },
  backButtonText: { color: '#fff', marginLeft: 5, fontSize: 16, fontWeight: '600' },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  classInfo: { fontSize: 14, color: '#e0e0ff', marginTop: 4, textAlign: 'center', fontStyle: 'italic' },
  
  dateSection: { padding: 16, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, elevation: 2 },
  dateLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  dateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  dateButtonText: { fontSize: 16, color: '#333', flex: 1, marginLeft: 8 },
  
  content: { flex: 1 },
  contentContainer: { paddingBottom: 20 },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  
  attendanceContainer: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  
  sessionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sessionTitle: { fontSize: 18, fontWeight: 'bold', color: '#4a90e2' },
  sessionStats: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  statsText: { fontSize: 14, fontWeight: '600', color: '#333' },
  sessionInfo: { marginBottom: 16 },
  infoText: { fontSize: 14, color: '#666', marginBottom: 4 },
  editSessionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4a90e2', padding: 12, borderRadius: 8 },
  editSessionButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  
  noDataContainer: { alignItems: 'center', padding: 40 },
  noDataText: { fontSize: 18, fontWeight: 'bold', color: '#666', marginTop: 16 },
  noDataSubText: { fontSize: 14, color: '#999', marginTop: 8, textAlign: 'center' },
  
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 4 },
  editListContent: { padding: 16 },
  editStudentCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 16, marginBottom: 8, borderRadius: 8, borderLeftWidth: 6,
  },
  editPresent: { backgroundColor: '#f8fff8', borderLeftColor: '#4caf50' },
  editAbsent: { backgroundColor: '#fff8f8', borderLeftColor: '#f44336' },
  editStudentInfo: { flex: 1 },
  editStudentName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  editStudentId: { fontSize: 12, color: '#666', marginTop: 2 },
  editStatus: { fontSize: 14, fontWeight: '600' },
  editStatusPresent: { color: '#4caf50' },
  editStatusAbsent: { color: '#f44336' },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  submitEditButton: { backgroundColor: '#4a90e2', padding: 16, borderRadius: 8, alignItems: 'center' },
  submitEditButtonDisabled: { backgroundColor: '#a0a0a0' },
  submitEditText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
   modalSearchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#333',
  },
  modalClearButton: {
    padding: 4,
  },
  modalResultCount: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  modalEmptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  modalEmptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '600',
  },
  modalEmptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});