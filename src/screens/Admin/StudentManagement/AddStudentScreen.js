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
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../../api/api';

const AddStudentScreen = ({ route }) => {
  const { board } = route.params || {};

  const [form, setForm] = useState({
    name: '',
    className: '',
    section: '',
    rollNo: '',
    admissionNumber: '',
    studentEmail: '',
    dob: '',
    gender: '',
    address: '',
    admissionDate: '',
    fatherName: '',
    fatherOccupation: '',
    fatherContact: '',
    motherName: '',
    motherOccupation: '',
    motherContact: '',
    parentEmail: '',
  });

  const [submitError, setSubmitError] = useState('');

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showAdmissionDatePicker, setShowAdmissionDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleChange = (field, value) => {
    setSubmitError('');
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDobChange = (event, selectedDate) => {
    setShowDobPicker(false);
    if (event?.type === 'set' && selectedDate) {
      handleChange('dob', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleAdmissionDateChange = (event, selectedDate) => {
    setShowAdmissionDatePicker(false);
    if (event?.type === 'set' && selectedDate) {
      handleChange('admissionDate', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleGenderSelect = (gender) => {
    handleChange('gender', gender);
    setShowGenderPicker(false);
  };

  const handleSubmit = async () => {
    setSubmitError('');

    const requiredFields = [
      'name',
      'className',
      'section',
      'rollNo',
      'admissionNumber',
      'fatherName',
      'fatherContact',
    ];

    for (let field of requiredFields) {
      if (!form[field]) {
        setSubmitError(`Please fill ${field}`);
        return;
      }
    }

    const studentData = {
      name: form.name.trim(),
      email: form.studentEmail?.trim() || '',
      classname: form.className.trim(),
      section: form.section.trim().toUpperCase(),
      rollnumber: form.rollNo.trim(),
      admissionnumber: form.admissionNumber.trim(),
      dob: form.dob || '',
      gender: form.gender || '',
      address: form.address || '',
      admissiondate: form.admissionDate || '',
      board: board || '',
      fathername: form.fatherName || '',
      fatheroccupation: form.fatherOccupation || '',
      fathercontact: form.fatherContact || '',
      mothername: form.motherName || '',
      motheroccupation: form.motherOccupation || '',
      mothercontact: form.motherContact || '',
      parentemail: form.parentEmail || '',
    };

    try {
      const res = await api.post(`/api/admin/students`,{ studentData });

      Alert.alert('Success', res.data.message);

      setForm({
        name: '',
        className: '',
        section: '',
        rollNo: '',
        admissionNumber: '',
        studentEmail: '',
        dob: '',
        gender: '',
        address: '',
        admissionDate: '',
        fatherName: '',
        fatherOccupation: '',
        fatherContact: '',
        motherName: '',
        motherOccupation: '',
        motherContact: '',
        parentEmail: '',
      });
    } catch (err) {
      const data = err.response?.data;
      if (Array.isArray(data?.errors)) {
        setSubmitError(data.errors.join('\n'));
      } else if (data?.error) {
        setSubmitError(data.error);
      } else if (data?.message) {
        setSubmitError(data.message);
      } else {
        setSubmitError('Something went wrong. Please check the form.');
      }
    }
  };

  const fields = [
    ['name', 'Full Name'],
    ['className', 'Class (e.g. 10)'],
    ['section', 'Section (e.g. A)'],
    ['rollNo', 'Roll Number'],
    ['admissionNumber', 'Admission Number'],
    ['studentEmail', 'Student Email (optional)'],
    ['address', 'Address'],
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
        <Text style={styles.title}>
          Add New Student {board ? `(${board})` : ''}
        </Text>

        {fields.map(([field, placeholder]) => (
          <TextInput
            key={field}
            placeholder={placeholder}
            value={form[field]}
            onChangeText={(text) => handleChange(field, text)}
            style={styles.input}
          />
        ))}

        {/* DOB */}
        <TouchableOpacity style={styles.pickerInput} onPress={() => setShowDobPicker(true)}>
          <Text style={form.dob ? styles.pickerText : styles.pickerPlaceholder}>
            {form.dob || 'Date of Birth'}
          </Text>
        </TouchableOpacity>

        {showDobPicker && (
          <DateTimePicker
            value={form.dob ? new Date(form.dob) : new Date()}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={handleDobChange}
            maximumDate={new Date()}
          />
        )}

        {/* Admission Date */}
        <TouchableOpacity style={styles.pickerInput} onPress={() => setShowAdmissionDatePicker(true)}>
          <Text style={form.admissionDate ? styles.pickerText : styles.pickerPlaceholder}>
            {form.admissionDate || 'Admission Date'}
          </Text>
        </TouchableOpacity>

        {showAdmissionDatePicker && (
          <DateTimePicker
            value={form.admissionDate ? new Date(form.admissionDate) : new Date()}
            mode="date"
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={handleAdmissionDateChange}
          />
        )}

        {/* Gender */}
        <TouchableOpacity style={styles.pickerInput} onPress={() => setShowGenderPicker(true)}>
          <Text style={form.gender ? styles.pickerText : styles.pickerPlaceholder}>
            {form.gender || 'Gender'}
          </Text>
        </TouchableOpacity>

        <Modal transparent visible={showGenderPicker} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              {['Male', 'Female', 'Other'].map(g => (
                <TouchableOpacity
                  key={g}
                  style={styles.genderOption}
                  onPress={() => handleGenderSelect(g)}
                >
                  <Text style={styles.genderText}>{g}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

        <Button title="Add Student" onPress={handleSubmit} color="#ac1d1dff" />
      </View>
    </ScrollView>
  );
};

export default AddStudentScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, paddingVertical: 30, backgroundColor: '#fafafa' },
  form: {
    width: width > 400 ? 350 : '90%',
    alignSelf: 'center',
    backgroundColor: '#fecaca',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000000',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  pickerInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    height: 44,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  pickerText: { color: '#000' },
  pickerPlaceholder: { color: '#888' },
  errorText: {
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  genderOption: {
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  genderText: { fontSize: 16 },
  cancelButtonText: { marginTop: 10, color: '#666' },
});
