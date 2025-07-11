import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Button,
  Alert,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../config/baseURL';

const AddStudentScreen = () => {
  const [form, setForm] = useState({
    name: '',
    userId: '',
    password: '',
    className: '',
    section: '',
    dob: '',
    gender: '',
    address: '',
    admissionDate: '',
    bloodGroup: '',
    profileImage: '',

    // ✅ Parent-related fields
    fatherName: '',
    fatherOccupation: '',
    fatherContact: '',
    motherName: '',
    motherOccupation: '',
    motherContact: '',
    parentEmail: '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    const requiredFields = ['name', 'userId', 'password', 'className', 'section'];
    for (let field of requiredFields) {
      if (!form[field]) {
        Alert.alert('Validation Error', `Please fill in the ${field} field.`);
        return;
      }
    }

    try {
      const payload = {
        name: form.name.trim(),
        userId: form.userId.trim().toLowerCase(),
        password: form.password.trim(),
        className: form.className.trim(),
        section: form.section.trim().toUpperCase(),
        dob: form.dob?.trim() || '',
        gender: form.gender?.trim() || '',
        address: form.address?.trim() || '',
        admissionDate: form.admissionDate?.trim() || '',
        bloodGroup: form.bloodGroup?.trim() || '',
        profileImage: form.profileImage?.trim() || '',

        // ✅ Parent data
        fatherName: form.fatherName?.trim() || '',
        fatherOccupation: form.fatherOccupation?.trim() || '',
        fatherContact: form.fatherContact?.trim() || '',
        motherName: form.motherName?.trim() || '',
        motherOccupation: form.motherOccupation?.trim() || '',
        motherContact: form.motherContact?.trim() || '',
        parentEmail: form.parentEmail?.trim() || '',
      };

      const res = await axios.post(`${BASE_URL}/api/admin/add-student`, payload);
      Alert.alert('✅ Success', res.data.message);

      setForm({
        name: '',
        userId: '',
        password: '',
        className: '',
        section: '',
        dob: '',
        gender: '',
        address: '',
        admissionDate: '',
        bloodGroup: '',
        profileImage: '',
        fatherName: '',
        fatherOccupation: '',
        fatherContact: '',
        motherName: '',
        motherOccupation: '',
        motherContact: '',
        parentEmail: '',
      });
    } catch (err) {
      console.error('❌ Error adding student:', err);
      Alert.alert('❌ Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  const fields = [
    ['name', 'Full Name'],
    ['userId', 'Student ID'],
    ['password', 'Password'],
    ['className', 'Class (e.g. 6)'],
    ['section', 'Section (e.g. A)'],
    ['dob', 'Date of Birth (YYYY-MM-DD)'],
    ['gender', 'Gender'],
    ['address', 'Address'],
    ['admissionDate', 'Admission Date (optional)'],
    ['bloodGroup', 'Blood Group (optional)'],
    ['profileImage', 'Profile Image URL (optional)'],
    // ✅ Parent Fields
    ['fatherName', "Father's Name"],
    ['fatherOccupation', "Father's Occupation"],
    ['fatherContact', "Father's Contact"],
    ['motherName', "Mother's Name"],
    ['motherOccupation', "Mother's Occupation"],
    ['motherContact', "Mother's Contact"],
    ['parentEmail', 'Parent Email (optional)'],
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.form}>
        <Text style={styles.title}>Add New Student</Text>

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

        <Button title="Add Student" onPress={handleSubmit} color="#1e3a8a" />
      </View>
    </ScrollView>
  );
};

export default AddStudentScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    backgroundColor: '#f0f4ff',
  },
  form: {
    width: width > 400 ? 350 : '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1e3a8a',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
});
