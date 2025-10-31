import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { BASE_URL } from '@env';

export default function EditFacultyScreen({ route, navigation }) {
  const { faculty } = route.params;

  const [name, setName] = useState(faculty.name || '');
  const [email, setEmail] = useState(faculty.email || '');
  const [gender, setGender] = useState(faculty.gender || 'Male');
  const [dob, setDob] = useState(new Date(faculty.dateOfBirth || new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [address, setAddress] = useState(faculty.address || '');
  const [phone, setPhone] = useState(faculty.phone || '');
  const [password, setPassword] = useState(faculty.password || '');
  const [showPassword, setShowPassword] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  const handleUpdate = async () => {
    const updated = {
      name: name.trim(),
      email: email.trim(),
      gender,
      dateOfBirth: dob.toISOString().substring(0, 10),
      address: address.trim(),
      phone: phone.trim(),
      password: password.trim(),
    };

    try {
      await axios.put(`${BASE_URL}/api/faculty/${faculty.userId}`, updated);
      Alert.alert('✅ Success', 'Faculty updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error updating faculty:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to update faculty.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Faculty</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Full Name"
        style={styles.input}
      />

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Phone"
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
        style={styles.input}
      />

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{dob.toISOString().substring(0, 10)}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Gender</Text>
      <View style={styles.genderWrapper}>
        <Button
          title="Male"
          color={gender === 'Male' ? '#1e3a8a' : '#ccc'}
          onPress={() => setGender('Male')}
        />
        <Button
          title="Female"
          color={gender === 'Female' ? '#1e3a8a' : '#ccc'}
          onPress={() => setGender('Female')}
        />
        <Button
          title="Other"
          color={gender === 'Other' ? '#1e3a8a' : '#ccc'}
          onPress={() => setGender('Other')}
        />
      </View>

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry={!showPassword}
        style={styles.input}
      />
      <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
        <Text style={styles.togglePassword}>
          {showPassword ? '🙈 Hide Password' : '👁️ Show Password'}
        </Text>
      </TouchableOpacity>

      <Button title="Save Changes" color="#1e3a8a" onPress={handleUpdate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 35,
    backgroundColor: '#ffffffff',
    flexGrow: 1,
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
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  dateInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e3a8a',
  },
  genderWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  togglePassword: {
    color: '#1e3a8a',
    marginBottom: 15,
    textAlign: 'right',
  },
});
