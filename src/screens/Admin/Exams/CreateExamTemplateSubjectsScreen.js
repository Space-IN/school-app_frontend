import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../api/api';


export default function CreateExamTemplateSubjectsScreen({ route, navigation }) {
  const { board, form: step1Data, mode = 'CREATE' } = route.params || {};

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchSubjects = async () => {
    try {
      const res = await api.get(`/api/admin/subject/assigned-subjects?classAssigned=${step1Data.grade}&board=${board}`);

      if (res.data.length > 0) {
        // Filter out duplicates based on subjectCode
        const uniqueSubjects = [];
        const seenCodes = new Set();

        for (const sub of res.data) {
          const subjectCode = sub.subjectMasterId?.code;
          const subjectName = sub.subjectMasterId?.name;

          if (subjectCode && !seenCodes.has(subjectCode)) {
            seenCodes.add(subjectCode);
            uniqueSubjects.push({
              subjectCode: subjectCode,
              subjectName: subjectName,
              components: [{ name: '', maxMarks: '', passMarks: '' }],
            });
          }
        }

        setSubjects(uniqueSubjects);
      } else {
        setSubjects([]);
      }
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
      setSubjects([]);
      Alert.alert('Error', 'Unable to fetch subjects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects()
  }, []);

  

  const updateComponent = (sIndex, cIndex, key, value) => {
    const updated = [...subjects];
    updated[sIndex].components[cIndex][key] = value;
    setSubjects(updated);
  };

  const addComponent = (sIndex) => {
    const updated = [...subjects];
    updated[sIndex].components.push({
      name: '',
      maxMarks: '',
      passMarks: '',
    });
    setSubjects(updated);
  };

  const removeComponent = (sIndex, cIndex) => {
    const updated = [...subjects];
    if (updated[sIndex].components.length === 1) return;
    updated[sIndex].components.splice(cIndex, 1);
    setSubjects(updated);
  };


  const handleSubmit = async () => {
    if (subjects.length === 0) {
      Alert.alert('No Subjects', 'Please add subject details.');
      return;
    }

    const filledSubjects = subjects.filter(sub =>
      sub.components.some(
        c => c.name.trim() !== '' || c.maxMarks !== ''
      )
    );

    if (filledSubjects.length === 0) {
      Alert.alert(
        'Validation Error',
        'Please add subject details before submitting.'
      );
      return;
    }

    for (const sub of filledSubjects) {
      for (const comp of sub.components) {
        if (!comp.name || !comp.maxMarks) {
          Alert.alert(
            'Validation Error',
            `Each filled component in ${sub.subjectName} must have name and max marks`
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
      subjects: filledSubjects.map(sub => ({
        subjectCode: sub.subjectCode,
        components: sub.components.map(c => ({
          name: c.name.trim(),
          maxMarks: Number(c.maxMarks),
          ...(c.passMarks ? { passMarks: Number(c.passMarks) } : {}),
        })),
      })),
    };

    try {
      const res = await api.post(
        '/api/admin/assessment/assessment-template',
        payload
      );

      if (res.data?.success) {
        Alert.alert(
          'Success',
          'Assessment template created successfully.',
          [{ text: 'OK', onPress: () => navigation.popToTop() }]
        );
      }
    } catch (err) {
      console.error('Create template failed:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Request failed'
      );
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Configure Subjects</Text>
          <Text style={styles.subtitle}>
            {step1Data.assessmentName} • Class {step1Data.grade}
          </Text>
        </View>


        {subjects.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={42} color="#999" />
            <Text style={styles.emptyTitle}>No Subjects Found</Text>
            <Text style={styles.emptyText}>
              No subjects are configured for this class and board.
              Please add subjects in Subject Master.
            </Text>
          </View>
        )}


        {subjects.map((subject, sIndex) => (
          <View key={subject.subjectCode} style={styles.subjectCard}>
            <Text style={styles.subjectTitle}>
              {subject.subjectName} ({subject.subjectCode})
            </Text>

            {subject.components.map((comp, cIndex) => (
              <View key={cIndex} style={styles.componentCard}>
                <TextInput
                  style={styles.input}
                  placeholder="Component Name (Theory / Practical)"
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

        <TouchableOpacity
          style={[
            styles.submitBtn,
            subjects.length === 0 && { backgroundColor: '#ccc' },
          ]}
          disabled={subjects.length === 0}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>
            {mode === 'EDIT' ? 'Update Template' : 'Create Template'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#ac1d1dff' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 6,
  },

  subjectCard: {
    backgroundColor: '#fecaca',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },

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
  addComponentText: { marginLeft: 6, color: '#ac1d1dff' },

  submitBtn: {
    backgroundColor: '#ac1d1dff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});