import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  Dimensions,
  Platform,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../../api/api';

/**
 * Safely convert YYYY-MM-DD → Date (Android-safe)
 */
const safeDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const AddFacultyScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    gender: '',
    board: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    department: '',
    designation: '',
    joinDate: '',
  });

  const [showDOBPicker, setShowDOBPicker] = useState(false);
  const [showJoinPicker, setShowJoinPicker] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const { name, email, gender, board, phone, joinDate } = formData;

    // Required fields check (schema-aligned)
    if (!name || !email || !gender || !board || !phone || !joinDate) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    try {
      /** Build payload EXACTLY how Joi expects */
      const facultyData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        gender,
        board,
        phone: phone.trim(),
        joinDate: new Date(joinDate).toISOString(), // REQUIRED ISO
      };

      // Optional fields (ONLY if present)
      if (formData.dateOfBirth) {
        facultyData.dateOfBirth = new Date(formData.dateOfBirth).toISOString();
      }
      if (formData.address) {
        facultyData.address = formData.address.trim();
      }
      if (formData.department) {
        facultyData.department = formData.department.trim();
      }
      if (formData.designation) {
        facultyData.designation = formData.designation.trim();
      }

      const response = await api.post('/api/admin/faculty', { facultyData });

      Alert.alert('Success', response.data.message);

      // Reset form
      setFormData({
        name: '',
        email: '',
        gender: '',
        board: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        department: '',
        designation: '',
        joinDate: '',
      });
    } catch (err) {
      console.log('CREATE FACULTY ERROR:', err.response?.data);

      const data = err.response?.data;
      let message = 'Failed to create faculty';

      if (data?.error) {
        message = data.error;
      } else if (data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        message = data.errors[firstKey];
      }

      Alert.alert('Error', message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Add Faculty</Text>

        <TextInput
          placeholder="Name *"
          value={formData.name}
          onChangeText={t => handleChange('name', t)}
          style={styles.input}
        />

        <TextInput
          placeholder="Email *"
          value={formData.email}
          onChangeText={t => handleChange('email', t)}
          style={styles.input}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.gender}
            onValueChange={v => handleChange('gender', v)}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <Text style={styles.label}>Board *</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.board}
            onValueChange={v => handleChange('board', v)}
          >
            <Picker.Item label="Select Board" value="" />
            <Picker.Item label="STATE" value="STATE" />
            <Picker.Item label="CBSE" value="CBSE" />
          </Picker>
        </View>

        <Text style={styles.label}>Date of Birth</Text>
        <Pressable
          style={styles.dateInput}
          onPress={() => setShowDOBPicker(true)}
        >
          <Text style={{ color: formData.dateOfBirth ? '#000' : '#999' }}>
            {formData.dateOfBirth || 'Select Date of Birth'}
          </Text>
        </Pressable>

        {showDOBPicker && (
          <DateTimePicker
            value={safeDate(formData.dateOfBirth)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(e, d) => {
              setShowDOBPicker(false);
              if (d) handleChange('dateOfBirth', d.toISOString().split('T')[0]);
            }}
          />
        )}

        <TextInput
          placeholder="Address"
          value={formData.address}
          onChangeText={t => handleChange('address', t)}
          style={styles.input}
        />

        <TextInput
          placeholder="Phone *"
          value={formData.phone}
          onChangeText={t => handleChange('phone', t)}
          style={styles.input}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Designation"
          value={formData.designation}
          onChangeText={t => handleChange('designation', t)}
          style={styles.input}
        />

        <TextInput
          placeholder="Department"
          value={formData.department}
          onChangeText={t => handleChange('department', t)}
          style={styles.input}
        />

        <Text style={styles.label}>Join Date *</Text>
        <Pressable
          style={styles.dateInput}
          onPress={() => setShowJoinPicker(true)}
        >
          <Text style={{ color: formData.joinDate ? '#000' : '#999' }}>
            {formData.joinDate || 'Select Join Date'}
          </Text>
        </Pressable>

        {showJoinPicker && (
          <DateTimePicker
            value={safeDate(formData.joinDate)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, d) => {
              setShowJoinPicker(false);
              if (d) handleChange('joinDate', d.toISOString().split('T')[0]);
            }}
          />
        )}

        <View style={styles.buttonWrapper}>
          <Button title="Add Faculty" onPress={handleSubmit} color="#ac1d1dff" />
        </View>
      </View>
    </ScrollView>
  );
};

export default AddFacultyScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#ffffff',
  },
  formContainer: {
    width: width > 400 ? 350 : '90%',
    alignSelf: 'center',
    backgroundColor: '#fecaca',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#020202',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
  buttonWrapper: {
    marginTop: 10,
  },
});
