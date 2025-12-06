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
  TouchableOpacity,
  Modal,
} from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddStudentScreen = ({ route }) => {
  const { board } = route.params || {};

  const [form, setForm] = useState({
    name: '',
    userId: '',
    password: '',
    className: '',
    section: '',
    rollNo: '',
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

  // State for date pickers
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showAdmissionDatePicker, setShowAdmissionDatePicker] = useState(false);

  // State for gender picker modal
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  // Date picker handlers
  const handleDobChange = (event, selectedDate) => {
    setShowDobPicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleChange('dob', formattedDate);
    }
  };

  const handleAdmissionDateChange = (event, selectedDate) => {
    setShowAdmissionDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleChange('admissionDate', formattedDate);
    }
  };

  // Gender selection handler
  const handleGenderSelect = (gender) => {
    handleChange('gender', gender);
    setShowGenderPicker(false);
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
        rollNo: form.rollNo.trim(),
        admissionNumber: form.admissionNumber?.trim() || '',
        studentEmail: form.studentEmail?.trim() || '',
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
        board: board || '',
      };

      const res = await axios.post(`${BASE_URL}/api/admin/add-student`, payload);
      Alert.alert('✅ Success', res.data.message);

      setForm({
        name: '',
        userId: '',
        password: '',
        className: '',
        section: '',
        rollNo: '',
        admissionNumber: '',
        studentEmail: '',
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
    ['name', 'Full Name', 'text'],
    ['userId', 'Student ID', 'text'],
    ['password', 'Password', 'text'],
    ['className', 'Class (e.g. 6)', 'text'],
    ['section', 'Section (e.g. A)', 'text'],
    ['rollNo', 'Roll Number', 'text'],
    ['studentEmail', 'Student Email (optional)', 'text'],
    ['admissionNumber', 'Admission Number', 'text'],
    ['address', 'Address', 'text'],
    ['bloodGroup', 'Blood Group (optional)', 'text'],
    ['profileImage', 'Profile Image URL (optional)', 'text'],
    ['fatherName', "Father's Name", 'text'],
    ['fatherOccupation', "Father's Occupation", 'text'],
    ['fatherContact', "Father's Contact", 'text'],
    ['motherName', "Mother's Name", 'text'],
    ['motherOccupation', "Mother's Occupation", 'text'],
    ['motherContact', "Mother's Contact", 'text'],
    ['parentEmail', 'Parent Email (optional)', 'text'],
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.form}>
        <Text style={styles.title}>Add New Student {board ? `(${board})` : ''}</Text>

        {fields.map(([field, placeholder, type]) => (
          <TextInput
            key={field}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(text) => handleChange(field, text)}
            style={styles.input}
            autoCapitalize="none"
            secureTextEntry={field === 'password'}
          />
        ))}

        {/* Date of Birth Picker */}
        <TouchableOpacity
          style={styles.pickerInput}
          onPress={() => setShowDobPicker(true)}
        >
          <Text style={form.dob ? styles.pickerText : styles.pickerPlaceholder}>
            {form.dob || 'Date of Birth (Tap to select)'}
          </Text>
        </TouchableOpacity>

        {/* Admission Date Picker */}
        <TouchableOpacity
          style={styles.pickerInput}
          onPress={() => setShowAdmissionDatePicker(true)}
        >
          <Text style={form.admissionDate ? styles.pickerText : styles.pickerPlaceholder}>
            {form.admissionDate || 'Admission Date (Tap to select)'}
          </Text>
        </TouchableOpacity>

        {/* Gender Picker */}
        <TouchableOpacity
          style={styles.pickerInput}
          onPress={() => setShowGenderPicker(true)}
        >
          <Text style={form.gender ? styles.pickerText : styles.pickerPlaceholder}>
            {form.gender || 'Gender (Tap to select)'}
          </Text>
        </TouchableOpacity>

        {/* Date Pickers */}
        {showDobPicker && (
          <DateTimePicker
            value={form.dob ? new Date(form.dob) : new Date()}
            mode="date"
            display="default"
            onChange={handleDobChange}
            maximumDate={new Date()}
          />
        )}

        {showAdmissionDatePicker && (
          <DateTimePicker
            value={form.admissionDate ? new Date(form.admissionDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleAdmissionDateChange}
            maximumDate={new Date()}
          />
        )}

        {/* Gender Picker Modal */}
        <Modal
          visible={showGenderPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGenderPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Gender</Text>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleGenderSelect('Male')}
              >
                <Text style={styles.genderText}>Male</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => handleGenderSelect('Female')}
              >
                <Text style={styles.genderText}>Female</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowGenderPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    backgroundColor: '#fafafaff',
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
  pickerInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    height: 44,
  },
  pickerText: {
    color: '#000',
  },
  pickerPlaceholder: {
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1e3a8a',
  },
  genderOption: {
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});