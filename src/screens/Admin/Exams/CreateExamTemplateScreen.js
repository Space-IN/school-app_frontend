import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const getCurrentAcademicYear = () => {
  const year = new Date().getFullYear();
  return `${year}-${year + 1}`;
};

export default function CreateExamTemplateScreen({ route, navigation }) {
  const { board, mode = 'CREATE' } = route.params || {};

  const [form, setForm] = useState({
    academicYear: getCurrentAcademicYear(), 
    grade: '',
    assessmentName: '',
    assessmentType: '',
  });

  const [classModalVisible, setClassModalVisible] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    const { academicYear, grade, assessmentName, assessmentType } = form;

    if (!academicYear || !grade || !assessmentName || !assessmentType) {
      Alert.alert('Validation Error', 'Please fill all required fields.');
      return;
    }

    navigation.navigate('CreateExamTemplateSubjectsScreen', {
      board,
      form,
      mode,
    });
  };

  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {mode === 'EDIT' ? 'Edit Exam Template' : 'Create Exam Template'}
          </Text>
          <Text style={styles.subtitle}>Board: {board}</Text>
        </View>


        <View style={styles.field}>
          <Text style={styles.label}>Academic Year *</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={form.academicYear}
            editable={false}             
          />
        </View>


        <View style={styles.field}>
          <Text style={styles.label}>Class *</Text>

          <TouchableOpacity
            style={styles.selector}
            onPress={() => setClassModalVisible(true)}
          >
            <Text style={form.grade ? styles.selectorText : styles.placeholder}>
              {form.grade ? `Class ${form.grade}` : 'Select Class'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>


        <View style={styles.field}>
          <Text style={styles.label}>Assessment Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mid Term Exam"
            value={form.assessmentName}
            onChangeText={(val) => handleChange('assessmentName', val)}
          />
        </View>


        <View style={styles.field}>
          <Text style={styles.label}>Assessment Type *</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g. Theoretical, Competitive"
            value={form.assessmentType}
            onChangeText={(val) => handleChange('assessmentType', val)}
          />

          <View style={styles.presetRow}>
            {['Theoretical', 'Competitive'].map(type => (
              <TouchableOpacity
                key={type}
                style={styles.presetChip}
                onPress={() => handleChange('assessmentType', type)}
              >
                <Ionicons name="flash-outline" size={14} color="#1e3a8a" />
                <Text style={styles.presetText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


      <Modal
        transparent
        animationType="slide"
        visible={classModalVisible}
        onRequestClose={() => setClassModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setClassModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Class</Text>

            {classes.map(cls => (
              <TouchableOpacity
                key={cls}
                style={styles.modalItem}
                onPress={() => {
                  handleChange('grade', cls.toString());
                  setClassModalVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>Class {cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 30 },

  header: { marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#ac1d1dff' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },

  field: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },

  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#555',
  },

  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fafafa',
  },

  selectorText: { fontSize: 16, color: '#333', fontWeight: '500' },
  placeholder: { fontSize: 16, color: '#999' },

  presetRow: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#ac1d1dff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  presetText: { fontSize: 14, color: '#ac1d1dff', fontWeight: '500' },

  footer: { marginTop: 30 },
  nextButton: {
    backgroundColor: '#ac1d1dff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});
