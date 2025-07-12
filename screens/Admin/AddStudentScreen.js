import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

export default function AddStudentScreen({ navigation }) {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStudent = async () => {
    if (!name || !userId || !className || !section || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    const payload = {
      name: name.trim(),
      userId: userId.trim().toLowerCase(),
      className: className.trim(),
      section: section.trim(),
      password: password.trim(),
    };

    console.log('📦 Sending student data:', payload);

    try {
      setLoading(true);

      const response = await axios.post('http://10.221.34.143:5000/api/admin/add-student', payload);

      console.log('✅ Student added response:', response.data);
      Alert.alert('Success', 'Student added successfully');

      // Optionally reset fields
      setName('');
      setUserId('');
      setClassName('');
      setSection('');
      setPassword('');
    } catch (err) {
      console.error('❌ Add student error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Student</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Class (e.g. 10)"
        value={className}
        onChangeText={setClassName}
      />

      <TextInput
        style={styles.input}
        placeholder="Section (e.g. A)"
        value={section}
        onChangeText={setSection}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.button}>
        {loading ? (
          <ActivityIndicator size="small" color="#1e3a8a" />
        ) : (
          <Button title="Add Student" onPress={handleAddStudent} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9ff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    color: '#1e3a8a',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
  },
});
