// screens/Faculty/classes/performance/StudentSubjectMarksScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList,
  StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const StudentSubjectMarksScreen = ({ route }) => {
  const { students, grade, section } = route.params;

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [facultyId, setFacultyId] = useState(null);
  const [isTeachingSubject, setIsTeachingSubject] = useState(false);
  const [showInvalidSubjectMsg, setShowInvalidSubjectMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const examTypes = [
    'Unit Test-1', 'Unit Test-2', 'Midterm',
    'Unit Test-3', 'Unit Test-4', 'Final',
  ];

  useEffect(() => {
    fetchFacultyId();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!selectedSubject || !facultyId || !subjects.length) {
      setIsTeachingSubject(false);
      setShowInvalidSubjectMsg(false);
      return;
    }

    const isValid = subjects.includes(selectedSubject);
    setIsTeachingSubject(isValid);
    setShowInvalidSubjectMsg(!isValid);
  }, [selectedSubject, facultyId, subjects]);

  const fetchFacultyId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const parsed = JSON.parse(userDataString);
        setFacultyId(parsed.userId);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: 'Failed to load faculty data. Please log in again.',
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(
        `http://10.221.34.140:5000/api/schedule/class/${grade}/section/${section}/subjects`
      );
      if (res.data.subjects?.length) {
        setSubjects(res.data.subjects);
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Subjects Found',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error fetching subjects',
      });
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    setMarks({});
    setShowInvalidSubjectMsg(false);
  };

  const handleMarkChange = (studentId, value) => {
    setMarks((prevMarks) => ({
      ...prevMarks,
      [studentId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedExamType) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please select subject and exam type.',
      });
      return;
    }

    if (!isTeachingSubject) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Subject',
        text2: 'You are not assigned to this subject.',
      });
      return;
    }

    if (!facultyId) {
      Toast.show({
        type: 'error',
        text1: 'Faculty Missing',
        text2: 'Please log in again.',
      });
      return;
    }

    const maxMarks = selectedExamType.startsWith('Unit Test') ? 50 : 100;
    setIsSubmitting(true);

    try {
      let submitted = false;

      for (const studentId of Object.keys(marks)) {
        const enteredMark = Number(marks[studentId]);

        if (isNaN(enteredMark)) continue;

        if (enteredMark > maxMarks) {
          Toast.show({
            type: 'error',
            text1: 'Invalid Marks',
            text2: `Cannot exceed ${maxMarks}`,
          });
          setIsSubmitting(false);
          return;
        }

        const payload = {
          studentId,
          classAssigned: grade,
          section,
          examType: selectedExamType,
          subject: selectedSubject,
          facultyId,
          marksObtained: enteredMark,
        };

        try {
          await axios.post('http://10.221.34.140:5000/api/marks/submit', payload);
          submitted = true;
        } catch (error) {
          if (error.response?.status === 403) {
            Toast.show({
              type: 'error',
              text1: 'Not Authorized',
              text2: error.response.data.message || 'You cannot submit marks for this subject.',
            });
            setSelectedSubject('');
            setIsTeachingSubject(false);
            setIsSubmitting(false);
            return;
          }

          if (error.response?.status === 400) {
            Toast.show({
              type: 'info',
              text1: 'Already Submitted',
              text2: error.response.data.message || 'Marks already submitted.',
            });
            setIsSubmitting(false);
            return;
          }

          throw error;
        }
      }

      if (submitted) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Marks submitted!',
        });
        setMarks({});
      } else {
        Toast.show({
          type: 'info',
          text1: 'No valid marks',
        });
      }

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to submit marks. Try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaxMarks = () =>
    selectedExamType.startsWith('Unit Test') ? 50 : 100;

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

  const teachingSubjectSet = new Set(subjects);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>📘 Subject:</Text>
      {loadingSubjects ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(itemValue) => handleSubjectChange(itemValue)}
          >
            <Picker.Item label="Select Subject" value="" />
            {[...new Set([
              ...subjects,
              ...students.flatMap(s => s.subjects || [])
            ])].map((subject) => (
              <Picker.Item
                key={subject}
                label={
                  teachingSubjectSet.has(subject)
                    ? subject
                    : `❌ ${subject} (Not Assigned)`
                }
                value={subject}
              />
            ))}
          </Picker>
        </View>
      )}

      {showInvalidSubjectMsg && (
        <Text style={{ color: 'red', marginBottom: 10 }}>
          ❌ You are not assigned to this subject.
        </Text>
      )}

      <Text style={styles.label}>📋 Exam Type:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedExamType}
          onValueChange={(itemValue) => setSelectedExamType(itemValue)}
        >
          <Picker.Item label="Select Exam Type" value="" />
          {examTypes.map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderStudent}
        ListEmptyComponent={<Text>No students available</Text>}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!selectedSubject || !selectedExamType || !isTeachingSubject || isSubmitting) && {
            opacity: 0.6,
          },
        ]}
        onPress={handleSubmit}
        disabled={
          !selectedSubject || !selectedExamType || !isTeachingSubject || isSubmitting
        }
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
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  studentName: {
    flex: 1,
    fontSize: 16,
  },
  markInput: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
