import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { BASE_URL } from '@env';
import { useAuth } from "../../../../context/authContext";

const StudentSubjectMarksScreen = ({ route }) => {
  const { students, grade, section } = route.params;
  const { decodedToken } = useAuth(); 

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [marks, setMarks] = useState({});
  const [facultySubjects, setFacultySubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const facultyId = decodedToken?.userId || null;

  const examTypes = [
    'Unit Test-1', 'Unit Test-2', 'Midterm',
    'Unit Test-3', 'Unit Test-4', 'Final',
  ];

  useEffect(() => {
    if (facultyId) fetchSubjects();
  }, [facultyId]);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/subject/subjects/faculty/${facultyId}`);

      const filteredSubjects = res.data
        .filter(subj =>
          subj.classSectionAssignments?.some(cs => 
            String(cs.classAssigned).trim() === String(grade).trim() &&
            cs.section.trim().toUpperCase() === String(section).trim().toUpperCase()
          )
        )
        .map(subj => subj.subjectName);

      setFacultySubjects(filteredSubjects);

      if (filteredSubjects.length === 0) {
        Toast.show({ type: 'info', text1: 'No Subjects Found for this class/section' });
      }
    } catch (error) {
      console.log('Error fetching subjects:', error);
      Toast.show({ type: 'error', text1: 'Error fetching subjects' });
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setMarks({});
  };

  const handleMarkChange = (studentId, value) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const getMaxMarks = () => {
    if (!selectedExamType) return 0;
    return selectedExamType.startsWith('Unit Test') ? 50 : 100;
  };

  const canSubmit =
    selectedSubject &&
    selectedExamType &&
    Object.values(marks).some(m => m !== '' && !isNaN(m));

  const handleSubmit = async () => {
    if (!canSubmit) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Submission',
        text2: 'Select subject, exam type and enter valid marks.',
      });
      return;
    }

    setIsSubmitting(true);
    const maxMarks = getMaxMarks();

    try {
      
      const payload1 = {
        grade,
        section,
        test_name: selectedExamType,
        test_type: selectedExamType.includes('Unit Test') ? 'Written' : 'Exam',
        date: new Date().toISOString().split('T')[0],
        records: students.map(student => ({
          studentId: student.userId,
          subjects: [
            {
              subject: selectedSubject,
              markedBy: facultyId,
              maxMarks,
              marksObtained: Number(marks[student._id]) || 0,
            },
          ],
        })),
      };

      console.log("PAYLOAD SENT:", JSON.stringify(payload1, null, 2));

      const response = await axios.post(`${BASE_URL}/api/assessment/submit`, payload1);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data?.message || 'Marks submitted successfully!',
      });

      setMarks({});
    } catch (error) {
      console.log("Submit Error:", error.response?.data || error.message);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.response?.data?.message || 'Could not submit marks.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStudent = ({ item }) => (
    <View style={styles.studentRow}>
      <Text style={styles.studentName}>{item.name} ({item.userId})</Text>
      <TextInput
        style={styles.markInput}
        keyboardType="numeric"
        placeholder={`/${getMaxMarks()}`}
        value={marks[item._id] || ''}
        onChangeText={(value) => handleMarkChange(item._id, value)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📘 Subject:</Text>
      {loadingSubjects ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={handleSubjectChange}
          >
            <Picker.Item label="Select Subject" value="" />
            {facultySubjects.map(subject => (
              <Picker.Item key={subject} label={subject} value={subject} />
            ))}
          </Picker>
        </View>
      )}

      <Text style={styles.label}>📋 Exam Type:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedExamType}
          onValueChange={(itemValue) => setSelectedExamType(itemValue)}
        >
          <Picker.Item label="Select Exam Type" value="" />
          {examTypes.map(type => <Picker.Item key={type} label={type} value={type} />)}
        </Picker>
      </View>

      <FlatList
        data={students}
        keyExtractor={item => item._id}
        renderItem={renderStudent}
        ListEmptyComponent={<Text>No students available</Text>}
      />

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={!canSubmit || isSubmitting}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? 'Submitting...' : 'Submit Marks'}
        </Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default StudentSubjectMarksScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 25, marginBottom: 5 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15 },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc'
  },
  studentName: { flex: 1, fontSize: 16 },
  markInput: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'center'
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center'
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

