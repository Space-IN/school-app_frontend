import React, { useEffect, useState } from 'react';
import {
  View, Text, Button, Alert, ScrollView, StyleSheet, TextInput,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { BASE_URL } from '@env';

const AssignSubjectScreen = () => {
  const [subjectList, setSubjectList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [classSectionAssignments, setClassSectionAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, facultyRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/subject/subject-master`),
          axios.get(`${BASE_URL}/api/faculty/all`),
        ]);
        setSubjectList(subjectsRes.data || []);
        setFacultyList(facultyRes.data || []);
      } catch (err) {
        Alert.alert('Error', 'Failed to load subject/faculty data');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleAddClassSection = () => {
    if (!selectedClass || !selectedSection) {
      Alert.alert('Validation Error', 'Please select both class and section');
      return;
    }

    const duplicate = classSectionAssignments.find(
      (item) =>
        item.classAssigned === selectedClass && item.section === selectedSection
    );

    if (duplicate) {
      Alert.alert('Duplicate', 'This class-section is already added.');
      return;
    }

    setClassSectionAssignments((prev) => [
      ...prev,
      {
        classAssigned: selectedClass,
        section: selectedSection.toUpperCase(),
      },
    ]);

    setSelectedClass('');
    setSelectedSection('');
  };

  const handleSubmit = async () => {
    if (!subjectId || !facultyId || classSectionAssignments.length === 0) {
      Alert.alert('Validation Error', 'All fields are required including class-section');
      return;
    }

    try {
      const payload = {
        subjectMasterId: subjectId,
        facultyId,
        classSectionAssignments,
      };

      const res = await axios.post(`${BASE_URL}/api/subject/assign-subject`, payload);
      Alert.alert('✅ Success', res.data.message);

      setSubjectId('');
      setFacultyId('');
      setClassSectionAssignments([]);
    } catch (err) {
      console.error('❌ Error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
  <View style={{ flex: 1, backgroundColor: '#ffffffff' }}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Subject</Text>
      <RNPickerSelect
        onValueChange={setSubjectId}
        value={subjectId}
        placeholder={{ label: 'Select Subject', value: null }}
        items={subjectList.map((subject) => ({
          label: `${subject.name} (${subject.code})`,
          value: subject._id,
        }))}
        style={pickerSelectStyles}
      />

      <Text style={styles.label}>Select Faculty</Text>
      <RNPickerSelect
        onValueChange={setFacultyId}
        value={facultyId}
        placeholder={{ label: 'Select Faculty', value: null }}
        items={facultyList.map((fac) => ({
          label: `${fac.name} (${fac.userId})`,
          value: fac.userId,
        }))}
        style={pickerSelectStyles}
      />

      <Text style={styles.label}>Class</Text>
      <RNPickerSelect
        onValueChange={setSelectedClass}
        value={selectedClass}
        placeholder={{ label: 'Select Class', value: null }}
        items={Array.from({ length: 10 }, (_, i) => ({
          label: `${i + 1}th`,
          value: (i + 1).toString(),
        }))}
        style={pickerSelectStyles}
      />

      <Text style={styles.label}>Section</Text>
      <RNPickerSelect
        onValueChange={setSelectedSection}
        value={selectedSection}
        placeholder={{ label: 'Select Section', value: null }}
        items={['A', 'B', 'C', 'D'].map((sec) => ({
          label: sec,
          value: sec,
        }))}
        style={pickerSelectStyles}
      />

      <View style={{ marginVertical: 10 }}>
        <Button title="➕ Add Class-Section" onPress={handleAddClassSection} />
      </View>

      <Text style={styles.label}>Selected Class-Section:</Text>
      {classSectionAssignments.map((item, index) => (
        <Text key={index} style={styles.pair}>
          {item.classAssigned} - {item.section}
        </Text>
      ))}

      <View style={{ marginTop: 20 }}>
        <Button title="✅ Submit" onPress={handleSubmit} />
      </View>
    </ScrollView>
  </View>
);

};

const styles = StyleSheet.create({
  container: {
    padding: 35,
    paddingBottom: 60,
    backgroundColor: '#ffffffff',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#1e3a8a',
  },
  pair: {
    backgroundColor: '#faebebff',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    backgroundColor: '#faebebff',
    color: 'black',
    marginBottom: 15,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    backgroundColor: '#faebebff',
    color: 'black',
    marginBottom: 15,
  },
};

export default AssignSubjectScreen;
