// screens/admin/EditStudentScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../config/baseURL';

export default function EditStudentScreen({ route, navigation }) {
  const { student } = route.params;

  const [name, setName] = useState(student.name);
  const [className, setClassName] = useState(student.className);
  const [section, setSection] = useState(student.section);

  const handleUpdate = async () => {
    const cleanedUserId = student.userId?.trim();
    const url = `${BASE_URL}/api/admin/students/${encodeURIComponent(cleanedUserId)}`;
    console.log('📡 PUT URL:', url);

    try {
      await axios.put(url, {
        name: name.trim(),
        className: className.trim(),
        section: section.trim(),
      });

      Alert.alert('✅ Updated', 'Student data updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error updating student:', err);
      Alert.alert('Error', 'Could not update student');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Student</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={styles.input}
      />
      <TextInput
        value={className}
        onChangeText={setClassName}
        placeholder="Class"
        style={styles.input}
      />
      <TextInput
        value={section}
        onChangeText={setSection}
        placeholder="Section"
        style={styles.input}
      />

      <Button title="Save Changes" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f0f4ff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
