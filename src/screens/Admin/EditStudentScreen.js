 
// screens/admin/EditStudentScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Dimensions
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env';
import {api} from '../../api/api'

export default function EditStudentScreen({ route, navigation }) {
  const { student, onGoBack } = route.params;

  const [form, setForm] = useState({
    name: student.name || '',
    userId: student.userId || '',
    className: student.className || '',
    section: student.section || '',
    rollNo: student.rollNo || '',
    admissionNumber: student.admissionNumber || '',
    studentEmail: student.studentEmail || '',
    dob: student.dob || '',
    gender: student.gender || '',
    address: student.address || '',
    admissionDate: student.admissionDate || '',
    bloodGroup: student.bloodGroup || '',
    profileImage: student.profileImage || '',
    fatherName: student.fatherName || '',
    fatherOccupation: student.fatherOccupation || '',
    fatherContact: student.fatherContact || '',
    motherName: student.motherName || '',
    motherOccupation: student.motherOccupation || '',
    motherContact: student.motherContact || '',
    parentEmail: student.parentEmail || '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleUpdate = async () => {
    const cleanedUserId = form.userId?.trim().toLowerCase();
    const url = `${BASE_URL}/api/admin/students/${encodeURIComponent(cleanedUserId)}`;

    const payload = {
      name: form.name.trim(),
      userId: form.userId.trim().toLowerCase(),
      className: form.className.trim(),
      section: form.section.trim().toUpperCase(),
      rollNo: form.rollNo.trim(),
      admissionNumber: form.admissionNumber.trim(),
      studentEmail: form.studentEmail.trim().toLowerCase(),
      dob: form.dob?.trim() || '',
      gender: form.gender?.trim() || '',
      address: form.address?.trim() || '',
      admissionDate: form.admissionDate?.trim() || '',
      bloodGroup: form.bloodGroup?.trim() || '',
      profileImage: form.profileImage?.trim() || '',
      fatherName: form.fatherName?.trim() || '',
      fatherOccupation: form.fatherOccupation?.trim() || '',
      fatherContact: form.fatherContact?.trim() || '',
      motherName: form.motherName?.trim() || '',
      motherOccupation: form.motherOccupation?.trim() || '',
      motherContact: form.motherContact?.trim() || '',
      parentEmail: form.parentEmail?.trim() || '',
    };

    try {
      const response = await api.put(url, payload);
      Alert.alert('✅ Updated', 'Student data updated successfully');
      // Call the callback to refresh data in parent screen
      if (onGoBack) {
        onGoBack();
      }
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error updating student:', err);
      Alert.alert('Error', err.response?.data?.message || 'Could not update student');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.form}>
        <Text style={styles.heading}>Edit Student</Text>

        {[
          ['name', 'Full Name'],
          ['userId', 'User ID'],
          ['rollNo', 'Roll Number'],
          ['admissionNumber', 'Admission Number'],
          ['studentEmail', 'Student Email'],
          ['className', 'Class (e.g. 6)'],
          ['section', 'Section (e.g. A)'],
          ['dob', 'Date of Birth (YYYY-MM-DD)'],
          ['gender', 'Gender'],
          ['address', 'Address'],
          ['admissionDate', 'Admission Date (YYYY-MM-DD)'],
          ['bloodGroup', 'Blood Group (e.g. B+)'],
          ['profileImage', 'Profile Image URL'],
          ['fatherName', 'Father Name'],
          ['fatherOccupation', 'Father Occupation'],
          ['fatherContact', 'Father Contact'],
          ['motherName', 'Mother Name'],
          ['motherOccupation', 'Mother Occupation'],
          ['motherContact', 'Mother Contact'],
          ['parentEmail', 'Parent Email'],
        ].map(([field, placeholder]) => (
          <TextInput
            key={field}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(text) => handleChange(field, text)}
            style={styles.input}
            autoCapitalize="none"
          />
        ))}

        <Button title="Save Changes" onPress={handleUpdate} color="#1e3a8a" />
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
