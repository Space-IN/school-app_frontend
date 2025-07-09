import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../config/baseURL';

export default function EditFacultyScreen({ route, navigation }) {
  const { faculty } = route.params;

  const [name, setName] = useState(faculty.name || '');
  const [grade, setGrade] = useState(faculty.grade || ''); // ✅ Was classAssigned
  const [section, setSection] = useState(faculty.section || '');
  const [subjects, setSubjects] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/subjects/faculty/${faculty.userId}`);
        const assignedSubjects = res.data?.map((s) => s.name) || [];

        const allSubjectsSet = new Set();
        if (faculty.subject) allSubjectsSet.add(faculty.subject);
        assignedSubjects.forEach((s) => allSubjectsSet.add(s));

        setSubjects(Array.from(allSubjectsSet).join(', '));
      } catch (err) {
        console.error('❌ Error fetching assigned subjects:', err);
        Alert.alert('Error', 'Failed to load assigned subjects.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedSubjects();
  }, []);

  const handleUpdate = async () => {
    const updated = {
      name: name.trim(),
      grade: grade.trim(), // ✅ field name matches backend
      section: section.trim().toUpperCase(),
      subject: subjects
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s) // remove empty values
        .join(', '),
    };

    try {
      await axios.put(`${BASE_URL}/api/admin/faculty/${faculty.userId}`, updated);
      Alert.alert('Success', 'Faculty updated successfully');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error updating faculty:', err.response?.data || err.message);
      Alert.alert('Error', 'Failed to update faculty.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={{ marginTop: 10, color: '#1e3a8a' }}>Loading subjects...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Edit Faculty</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Faculty Name"
        style={styles.input}
      />
      <TextInput
        value={grade}
        onChangeText={setGrade}
        placeholder="Grade (e.g., 10)"
        style={styles.input}
      />
      <TextInput
        value={section}
        onChangeText={setSection}
        placeholder="Section (e.g., A)"
        style={styles.input}
      />
      <TextInput
        value={subjects}
        onChangeText={setSubjects}
        placeholder="Subjects (comma separated)"
        style={styles.input}
      />

      <Button title="Save Changes" color="#1e3a8a" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f4ff',
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
