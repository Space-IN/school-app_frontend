// screens/Admin/AddFacultyScreen.js
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
} from 'react-native';
import axios from 'axios';

const AddFacultyScreen = () => {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    password: '',
    subject: '',
    classAssigned: '',
    section: '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        userId: formData.userId.trim().toLowerCase(),
        name: formData.name.trim(),
        password: formData.password.trim(),
        subject: formData.subject.trim(),
        classAssigned: formData.classAssigned.trim(),
        section: formData.section.trim(),
      };

      const response = await axios.post('http://10.221.34.140:5000/api/admin/add-faculty', payload);
      Alert.alert('Success', response.data.message);

      setFormData({
        userId: '',
        name: '',
        password: '',
        subject: '',
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
        <Text style={styles.header}>Add Faculty</Text>

        {['userId', 'name', 'password', 'subject', 'classAssigned', 'section'].map((field) => (
          <TextInput
            key={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChangeText={(text) => handleChange(field, text)}
            secureTextEntry={field === 'password'}
            style={styles.input}
            multiline={false}
          />
        ))}

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
    backgroundColor: '#f0f4ff',
  },
  formContainer: {
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
  buttonWrapper: {
    marginTop: 10,
  },
});
