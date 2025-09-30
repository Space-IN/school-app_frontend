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
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import BASE_URL from '../../config/baseURL';

const AddFacultyScreen = () => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    phone: '',
    password: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    const {
      userId,
      name,
      email,
      gender,
      dateOfBirth,
      address,
      phone,
      password,
    } = formData;

    if (!userId || !name || !email || !gender || !dateOfBirth || !address || !phone || !password) {
      return Alert.alert('Error', 'Please fill all the fields');
    }

    try {
      const payload = {
        userId: userId.trim().toLowerCase(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        gender,
        dateOfBirth,
        address: address.trim(),
        phone: phone.trim(),
        password: password.trim(),
      };


      const response = await axios.post(`${BASE_URL}/api/faculty/add`, payload);

      Alert.alert('Success', response.data.message);

      setFormData({
        userId: '',
        name: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        address: '',
        phone: '',
        password: '',
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleChange('dateOfBirth', formattedDate);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>Add Faculty</Text>

        <TextInput
          placeholder="User ID"
          value={formData.userId}
          onChangeText={(text) => handleChange('userId', text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Name"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          style={styles.input}
          keyboardType="email-address"
        />

        {/* Gender Dropdown */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(itemValue) => handleChange('gender', itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="Male" />
            <Picker.Item label="Female" value="Female" />
          </Picker>
        </View>

        {/* Date Picker */}
        <Text style={styles.label}>Date of Birth</Text>
        <Pressable onPress={showDatepicker} style={styles.dateInput}>
          <Text style={{ color: formData.dateOfBirth ? '#000' : '#999' }}>
            {formData.dateOfBirth || 'Select Date'}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          placeholder="Address"
          value={formData.address}
          onChangeText={(text) => handleChange('address', text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Phone"
          value={formData.phone}
          onChangeText={(text) => handleChange('phone', text)}
          style={styles.input}
          keyboardType="phone-pad"
        />
        <TextInput
          placeholder="Password"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          style={styles.input}
          secureTextEntry
        />

        <View style={styles.buttonWrapper}>
          <Button title="Add Faculty" onPress={handleSubmit} color="#1e3a8a" />
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
    backgroundColor: '#bbdbfaff',
  },
  formContainer: {
    width: width > 400 ? 350 : '90%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 20,
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
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    marginBottom: 14,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
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
