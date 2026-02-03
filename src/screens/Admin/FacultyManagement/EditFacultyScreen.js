import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../../api/api';

export default function EditFacultyScreen({ route, navigation }) {
  const { faculty } = route.params;

  // Editable fields
  const [name, setName] = useState(faculty.name || '');
  const [email, setEmail] = useState(faculty.email || '');
  const [phone, setPhone] = useState(faculty.phone || '');
  const [address, setAddress] = useState(faculty.address || '');
  const [gender, setGender] = useState(faculty.gender || 'Male');

  const initialDob = faculty.dateOfBirth
    ? new Date(faculty.dateOfBirth)
    : new Date();

  const [dob, setDob] = useState(initialDob);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const handleUpdate = async () => {
    const updated = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gender,
      dateOfBirth: dob.toISOString().substring(0, 10),
    };

    try {
      await api.put(
        `/api/admin/faculty/${faculty.userId}`,
        updated
      );
      Alert.alert(' Success', 'Faculty updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error(
        ' Error updating faculty:',
        err.response?.data || err.message
      );
      Alert.alert('Error', 'Failed to update faculty.');
    }
  };

  const renderGenderButton = (value) => {
    const selected = gender === value;
    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.genderBtn,
          selected && styles.genderBtnActive,
        ]}
        onPress={() => setGender(value)}
      >
        <Text
          style={[
            styles.genderText,
            selected && styles.genderTextActive,
          ]}
        >
          {value}
        </Text>
      </TouchableOpacity>
    );
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
        {['Male', 'Female', 'Other'].map(renderGenderButton)}
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleUpdate}
      >
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 35,
    backgroundColor: '#fff',
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
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
  },
  dateInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e3a8a',
  },
  genderWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  genderBtnActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  genderText: {
    color: '#333',
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
