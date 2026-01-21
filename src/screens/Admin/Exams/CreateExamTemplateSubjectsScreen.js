import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../api/api';

export default function CreateExamTemplateSubjectsScreen({ route, navigation }) {
  const { board, form: step1Data, mode = 'CREATE' } = route.params || {};

  const [subjects, setSubjects] = useState([
    {
      subjectCode: 'MATH000',
      subjectName: 'Mathematics',
      components: [{ name: '', maxMarks: '', passMarks: '' }],
    },
    {
      subjectCode: 'PHY000',
      subjectName: 'Physics',
      components: [{ name: '', maxMarks: '', passMarks: '' }],
    },
  ]);

  const updateComponent = (sIndex, cIndex, key, value) => {
    const updated = [...subjects];
    updated[sIndex].components[cIndex][key] = value;
    setSubjects(updated);
  };

  const addComponent = (sIndex) => {
    const updated = [...subjects];
    updated[sIndex].components.push({ name: '', maxMarks: '', passMarks: '' });
    setSubjects(updated);
  };

  const removeComponent = (sIndex, cIndex) => {
    const updated = [...subjects];
    if (updated[sIndex].components.length === 1) return;
    updated[sIndex].components.splice(cIndex, 1);
    setSubjects(updated);
  };

  const handleSubmit = async () => {
    for (const sub of subjects) {
      for (const comp of sub.components) {
        if (!comp.name || !comp.maxMarks) {
          Alert.alert(
            'Validation Error',
            `Each component in ${sub.subjectName} must have name and max marks`
          );
          return;
        }
      }
    }

    const payload = {
      academicYear: step1Data.academicYear,
      grade: step1Data.grade,
      board,
      assessmentName: step1Data.assessmentName,
      assessmentType: step1Data.assessmentType,
      subjects: subjects.map(sub => ({
        subjectCode: sub.subjectCode,
        components: sub.components.map(c => ({
          name: c.name.trim(),
          maxMarks: Number(c.maxMarks),
          ...(c.passMarks ? { passMarks: Number(c.passMarks) } : {}),
        })),
      })),
    };

    console.log(' Payload:', JSON.stringify(payload, null, 2));
    console.log('Base URL:', api.defaults.baseURL);

    try {
      const res = await api.post(
        'api/admin/assessment/assessment-template',
        payload
      );

      console.log('Response:', res.data);

      if (res.data?.success) {
        Alert.alert('Success', 'Assessment template created successfully.', [
          { text: 'OK', onPress: () => navigation.popToTop() },
        ]);
      }
    } catch (err) {
      console.error(' Axios error full:', {
        message: err.message,
        code: err.code,
        config: err.config,
        response: err.response,
      });

      Alert.alert('Error', 'Request failed. Check logs.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Configure Subjects</Text>
          <Text style={styles.subtitle}>
            {step1Data.assessmentName} • Class {step1Data.grade}
          </Text>
        </View>

        {subjects.map((subject, sIndex) => (
          <View key={subject.subjectCode} style={styles.subjectCard}>
            <Text style={styles.subjectTitle}>{subject.subjectName}</Text>

            {subject.components.map((comp, cIndex) => (
              <View key={cIndex} style={styles.componentCard}>
                <TextInput
                  style={styles.input}
                  placeholder="Component Name"
                  value={comp.name}
                  onChangeText={(val) =>
                    updateComponent(sIndex, cIndex, 'name', val)
                  }
                />

                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.half]}
                    placeholder="Max Marks"
                    keyboardType="numeric"
                    value={comp.maxMarks}
                    onChangeText={(val) =>
                      updateComponent(sIndex, cIndex, 'maxMarks', val)
                    }
                  />
                  <TextInput
                    style={[styles.input, styles.half]}
                    placeholder="Pass Marks"
                    keyboardType="numeric"
                    value={comp.passMarks}
                    onChangeText={(val) =>
                      updateComponent(sIndex, cIndex, 'passMarks', val)
                    }
                  />
                </View>

                {subject.components.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeComponent(sIndex, cIndex)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addComponentBtn}
              onPress={() => addComponent(sIndex)}
            >
              <Ionicons name="add-circle-outline" size={18} color="#1e3a8a" />
              <Text style={styles.addComponentText}>Add Component</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Create Template</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#1e3a8a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  subjectCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  subjectTitle: { fontSize: 17, fontWeight: '600', marginBottom: 10 },
  componentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fafafa',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  removeBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  removeText: { marginLeft: 6, color: '#b91c1c' },
  addComponentBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  addComponentText: { marginLeft: 6, color: '#1e3a8a' },
  submitBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
