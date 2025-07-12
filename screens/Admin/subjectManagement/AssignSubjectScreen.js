// screens/Admin/AssignSubjectScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet, Dimensions, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';


const AssignSubjectScreen = () => {
  const [subjectList, setSubjectList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [formData, setFormData] = useState({
    subjectId: '',
    facultyId: '',
    classAssigned: '',
    section: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, facultyRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/subject/subject-master`),
          axios.get(`${BASE_URL}/api/faculty/all`)
        ]);
         console.log('Subjects:', subjectsRes.data);
         console.log('Faculty:', facultyRes.data);

        setSubjectList(subjectsRes.data || []);
        setFacultyList(facultyRes.data || []);
      } catch (err) {
        Alert.alert('Error', 'Failed to load data');
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const { subjectId, facultyId, classAssigned, section } = formData;
    if (!subjectId || !facultyId || !classAssigned || !section) {
      Alert.alert('Validation Error', 'All fields are required');
      return;
    }

    try {
      const payload = {
        subjectMasterId: subjectId,
        facultyId,
        classAssigned,
        section: section.toUpperCase(),
      };

      const res = await axios.post(`${BASE_URL}/api/subject/assign-subject`, payload);
      Alert.alert('✅ Success', res.data.message);

      setFormData({
        subjectId: '',
        facultyId: '',
        classAssigned: '',
        section: '',
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };



  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Assign Subject</Text>

        <Text style={styles.label}>Select Subject</Text>
        <Picker
          selectedValue={formData.subjectId}
          onValueChange={(value) => handleChange('subjectId', value)}
          style={styles.picker}
        >
          <Picker.Item label="-- Select Subject --" value="" />
          {subjectList.map((subject) => (
            <Picker.Item
              key={subject._id}
              label={`${subject.name} (${subject.code})`}
              value={subject._id}
            />
          ))}
        </Picker>

        <Text style={styles.label}>Select Faculty</Text>
        <Picker
          selectedValue={formData.facultyId}
          onValueChange={(value) => handleChange('facultyId', value)}
          style={styles.picker}
        >
          <Picker.Item label="-- Select Faculty --" value="" />
          {facultyList.map((fac) => (
            <Picker.Item key={fac.userId} label={`${fac.name} (${fac.userId})`} value={fac.userId} />
          ))}
        </Picker>

        <TextInput
          placeholder="Class Assigned (e.g., 1, 10)"
          value={formData.classAssigned}
          onChangeText={(text) => handleChange('classAssigned', text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Section (e.g., A)"
          value={formData.section}
          onChangeText={(text) => handleChange('section', text)}
          style={styles.input}
          autoCapitalize="characters"
        />

        <View style={styles.buttonWrapper}>
          <Button title="Assign Subject" onPress={handleSubmit} color="#1e3a8a" />
        </View>
      </View>
    </ScrollView>
  );
};

export default AssignSubjectScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    backgroundColor: '#f0f4ff',
  },
  formContainer: {
    width: width > 400 ? 350 : '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 35,
    borderRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#1e3a8a',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 14,
  },
  buttonWrapper: {
    marginTop: 10,
  },
});
