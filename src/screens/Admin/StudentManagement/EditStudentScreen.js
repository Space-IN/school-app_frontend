import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';

import { api } from '../../../api/api';

export default function EditStudentScreen({ route, navigation }) {
  const { student } = route.params;

  const [form, setForm] = useState({
    name: student.name || '',
    className: student.className || '',
    section: student.section || '',
    rollNo: student.rollNo || '',
    admissionNumber: student.admissionNumber || '',
    studentEmail: student.studentEmail || '',
    dob: student.dob || '',
    gender: student.gender || '',
    address: student.address || '',
    admissionDate: student.admissionDate || '',
    fatherName: student.fatherName || '',
    fatherOccupation: student.fatherOccupation || '',
    fatherContact: student.fatherContact || '',
    motherName: student.motherName || '',
    motherOccupation: student.motherOccupation || '',
    motherContact: student.motherContact || '',
    parentEmail: student.parentEmail || '',
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!student?._id) {
      Alert.alert('Error', 'Invalid student record');
      return;
    }

    const payload = {
      name: form.name.trim(),
      className: form.className.trim(),
      section: form.section.trim().toUpperCase(),
      rollNo: form.rollNo.trim(),
      admissionNumber: form.admissionNumber.trim(),
      studentEmail: form.studentEmail.trim().toLowerCase(),
      dob: form.dob || null,
      gender: form.gender || null,
      address: form.address || null,
      admissionDate: form.admissionDate || null,
      fatherName: form.fatherName || null,
      fatherOccupation: form.fatherOccupation || null,
      fatherContact: form.fatherContact || null,
      motherName: form.motherName || null,
      motherOccupation: form.motherOccupation || null,
      motherContact: form.motherContact || null,
      parentEmail: form.parentEmail
        ? form.parentEmail.trim().toLowerCase()
        : null,
    };

    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== null && value !== ''
      )
    );

    try {
      await api.put(
        `/api/admin/students/${student._id}`,
        cleanPayload
      );
      Alert.alert('✅ Updated', 'Student data updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error updating student:', err.response?.data || err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Could not update student'
      );
    }
  };

  const fields = [
    ['name', 'Full Name'],
    ['className', 'Class (e.g. 6)'],
    ['section', 'Section (e.g. A)'],
    ['rollNo', 'Roll Number'],
    ['admissionNumber', 'Admission Number'],
    ['studentEmail', 'Student Email'],
    ['dob', 'Date of Birth (YYYY-MM-DD)'],
    ['gender', 'Gender'],
    ['address', 'Address'],
    ['admissionDate', 'Admission Date (YYYY-MM-DD)'],
    ['fatherName', 'Father Name'],
    ['fatherOccupation', 'Father Occupation'],
    ['fatherContact', 'Father Contact'],
    ['motherName', 'Mother Name'],
    ['motherOccupation', 'Mother Occupation'],
    ['motherContact', 'Mother Contact'],
    ['parentEmail', 'Parent Email'],
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.form}>
        <Text style={styles.heading}>Edit Student</Text>

        {fields.map(([field, placeholder]) => (
          <TextInput
            key={field}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(text) => handleChange(field, text)}
            style={styles.input}
            autoCapitalize="none"
          />
        ))}

        <Button
          title="Save Changes"
          onPress={handleUpdate}
          color="#1e3a8a"
        />
      </View>
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    backgroundColor: '#ffffffff',
  },
  form: {
    width: width > 400 ? 350 : '90%',
    alignSelf: 'center',
    backgroundColor: '#faebebff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a',
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
});
