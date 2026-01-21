import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/api';


export default function ExamTemplateDetailsModal({
  visible,
  onClose,
  template,
  onUpdated,
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setDraft(JSON.parse(JSON.stringify(template)));
      setIsEditMode(false);
    }
  }, [template]);

  if (!draft) return null;


  const updateComponent = (sIndex, cIndex, key, value) => {
    const updated = [...draft.subjects];
    updated[sIndex].components[cIndex][key] = value;
    setDraft({ ...draft, subjects: updated });
  };

  const addComponent = (sIndex) => {
    const updated = [...draft.subjects];
    updated[sIndex].components.push({
      name: '',
      maxMarks: '',
      passMarks: '',
    });
    setDraft({ ...draft, subjects: updated });
  };

  const removeComponent = (sIndex, cIndex) => {
    const updated = [...draft.subjects];
    if (updated[sIndex].components.length === 1) return;
    updated[sIndex].components.splice(cIndex, 1);
    setDraft({ ...draft, subjects: updated });
  };


  const handleSave = async () => {
    for (const sub of draft.subjects) {
      for (const comp of sub.components) {
        if (!comp.name || !comp.maxMarks) {
          Alert.alert(
            'Validation Error',
            'Each component must have name and max marks'
          );
          return;
        }
      }
    }

    const payload = {
      academicYear: draft.academicYear,
      grade: draft.grade,
      board: draft.board,
      assessmentName: draft.assessmentName,
      assessmentType: draft.assessmentType,
      subjects: draft.subjects.map(sub => ({
        subjectCode: sub.subject.code,
        components: sub.components.map(c => ({
          name: c.name,
          maxMarks: Number(c.maxMarks),
          ...(c.passMarks ? { passMarks: Number(c.passMarks) } : {}),
        })),
      })),
    };

    try {
      setSaving(true);

      await api.put(
        `api/admin/assessment/assessment-template/${draft._id}`,
        payload
      );

      Alert.alert('Success', 'Template updated successfully');
      setIsEditMode(false);
      onUpdated(); 
      onClose();
    } catch (err) {
      console.error(' Update failed:', err);
      Alert.alert('Error', 'Failed to update template');
    } finally {
      setSaving(false);
    }
  };


  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Exam Template' : 'Exam Template Details'}
          </Text>

          {!isEditMode ? (
            <TouchableOpacity onPress={() => setIsEditMode(true)}>
              <Ionicons name="create-outline" size={22} color="#1e3a8a" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 22 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.label}>Assessment Name</Text>
            <TextInput
              style={styles.input}
              editable={isEditMode}
              value={draft.assessmentName}
              onChangeText={(v) =>
                setDraft({ ...draft, assessmentName: v })
              }
            />

            <Text style={styles.meta}>
              Class {draft.grade} • {draft.assessmentType} • {draft.board}
            </Text>
            <Text style={styles.metaSmall}>
              Academic Year: {draft.academicYear}
            </Text>
          </View>

          {draft.subjects.map((sub, sIndex) => (
            <View key={sub.subject._id} style={styles.subjectCard}>
              <Text style={styles.subjectTitle}>{sub.subject.name}</Text>

              {sub.components.map((comp, cIndex) => (
                <View key={cIndex} style={styles.componentCard}>
                  <TextInput
                    style={styles.input}
                    editable={isEditMode}
                    placeholder="Component Name"
                    value={comp.name}
                    onChangeText={(v) =>
                      updateComponent(sIndex, cIndex, 'name', v)
                    }
                  />

                  <View style={styles.row}>
                    <TextInput
                      style={[styles.input, styles.half]}
                      editable={isEditMode}
                      placeholder="Max Marks"
                      keyboardType="numeric"
                      value={String(comp.maxMarks)}
                      onChangeText={(v) =>
                        updateComponent(sIndex, cIndex, 'maxMarks', v)
                      }
                    />
                    <TextInput
                      style={[styles.input, styles.half]}
                      editable={isEditMode}
                      placeholder="Pass Marks"
                      keyboardType="numeric"
                      value={String(comp.passMarks || '')}
                      onChangeText={(v) =>
                        updateComponent(sIndex, cIndex, 'passMarks', v)
                      }
                    />
                  </View>

                  {isEditMode && sub.components.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeComponent(sIndex, cIndex)}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {isEditMode && (
                <TouchableOpacity
                  onPress={() => addComponent(sIndex)}
                >
                  <Text style={styles.addText}>+ Add Component</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {isEditMode && (
            <TouchableOpacity
              style={styles.saveBtn}
              disabled={saving}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
  },

  content: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  label: { fontSize: 13, color: '#555', marginBottom: 4 },

  meta: { fontSize: 13, color: '#666', marginTop: 6 },
  metaSmall: { fontSize: 12, color: '#888', marginTop: 2 },

  subjectCard: {
    backgroundColor: '#f5f7fb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },

  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },

  componentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    backgroundColor: '#fafafa',
  },

  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },

  removeText: {
    color: '#b91c1c',
    fontSize: 13,
    marginTop: 4,
  },

  addText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '500',
  },

  saveBtn: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
