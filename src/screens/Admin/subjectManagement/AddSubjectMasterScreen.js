import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Dimensions, Text } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@env';

const AddSubjectMasterScreen = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleSubmit = async () => {
    if (!name || !code) {
      Alert.alert('Error', 'Please enter subject name and code');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/subject/subject-master`, {
        name: name.trim(),
        code: code.trim().toUpperCase(),
      });

      Alert.alert('✅ Success', res.data.message);
      setName('');
      setCode('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.screen}> 
      <View style={styles.container}>
        <Text style={styles.header}>Add New Subject</Text>
        <TextInput
          placeholder="Subject Name (e.g., Math)"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Subject Code (e.g., MTH101)"
          value={code}
          onChangeText={setCode}
          style={styles.input}
        />
        <Button title="Create Subject" onPress={handleSubmit} color="#1e3a8a" />
      </View>
    </View>
  );
};

export default AddSubjectMasterScreen;

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffffff', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width > 400 ? 350 : '90%',
    backgroundColor: '#faebebff', 
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1e3a8a',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
  },
});
