import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../api/api';

const DropdownModal = ({ visible, title, options, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

export default function ClassScheduleXLSXUpload() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
  const SECTION_OPTIONS = ['A', 'B', 'C'];
  const BOARD_OPTIONS = ['CBSE', 'STATE'];

  const handlePickExcel = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    });

    if (result?.assets?.[0]) {
      setSelectedFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedClass || !selectedSection || !selectedBoard || !selectedFile) {
      return Alert.alert('Missing', 'Select board, class, section and file');
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('classAssigned', selectedClass);
      formData.append('section', selectedSection);
      formData.append('board', selectedBoard);
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      await api.post(`/api/admin/schedule/admin/set`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSelectedFile(null);
      Alert.alert('Success', 'Schedule uploaded');
    } catch (err) {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.centerWrapper}>
          <View style={styles.card}>
            <Ionicons
              name="calendar-outline"
              size={36}
              color="#ac1d1d"
              style={{ alignSelf: 'center', marginBottom: 10 }}
            />

            <Text style={styles.title}>Upload Class Schedule</Text>
            <Text style={styles.subtitle}>
              Upload an Excel (.xlsx) file to set the weekly timetable.
            </Text>

            {/* Board */}
            <Text style={styles.label}>Board</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setActiveDropdown('board')}
            >
              <Text style={styles.dropdownText}>
                {selectedBoard || 'Select Board'}
              </Text>
              <Ionicons name="chevron-down" size={18} />
            </TouchableOpacity>

            {/* Class */}
            <Text style={styles.label}>Class</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setActiveDropdown('class')}
            >
              <Text style={styles.dropdownText}>
                {selectedClass || 'Select Class'}
              </Text>
              <Ionicons name="chevron-down" size={18} />
            </TouchableOpacity>

            {/* Section */}
            <Text style={styles.label}>Section</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setActiveDropdown('section')}
            >
              <Text style={styles.dropdownText}>
                {selectedSection || 'Select Section'}
              </Text>
              <Ionicons name="chevron-down" size={18} />
            </TouchableOpacity>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.outlineBtn} onPress={handlePickExcel}>
                <Ionicons name="document-text-outline" size={18} />
                <Text>Choose File</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleUpload}>
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                    <Text style={{ color: '#fff' }}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {selectedFile && (
              <Text style={styles.fileChip}>✅ {selectedFile.name}</Text>
            )}

            {/* ✅ FORMAT NOTE */}
            <View style={styles.formatNote}>
              <View style={styles.formatHeader}>
                <Ionicons name="information-circle-outline" size={18} color="#92400e" />
                <Text style={styles.formatTitle}>Excel Format Required</Text>
              </View>

              <Text style={styles.formatText}>
                The first row of your Excel file must follow this exact format:
              </Text>

              <View style={styles.formatCodeBox}>
                <Text style={styles.formatCode}>
                  day, periodNumber, timeSlot, subjectCode, facultyIds
                </Text>
              </View>

              <Text style={styles.formatHint}>
                • facultyIds should be comma-separated (e.g. fac001,fac002){'\n'}
                • day should be like MONDAY, TUESDAY, etc.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Dropdowns */}
      <DropdownModal
        visible={activeDropdown === 'board'}
        title="Select Board"
        options={BOARD_OPTIONS}
        onSelect={setSelectedBoard}
        onClose={() => setActiveDropdown(null)}
      />
      <DropdownModal
        visible={activeDropdown === 'class'}
        title="Select Class"
        options={CLASS_OPTIONS}
        onSelect={setSelectedClass}
        onClose={() => setActiveDropdown(null)}
      />
      <DropdownModal
        visible={activeDropdown === 'section'}
        title="Select Section"
        options={SECTION_OPTIONS}
        onSelect={setSelectedSection}
        onClose={() => setActiveDropdown(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  centerWrapper: { flex: 1, justifyContent: 'center' },

  card: {
    backgroundColor: '#fecaca',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ac1d1d',
  },

  title: {
    fontSize: 18,
    color: '#ac1d1d',
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    marginTop: 10,
  },

  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ac1d1d',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
  },

  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#fd9082',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#ac1d1d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fileChip: {
    marginTop: 10,
    color: '#065f46',
    fontSize: 12,
    textAlign: 'center',
  },

  /* FORMAT NOTE */
  formatNote: {
    marginTop: 18,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },

  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },

  formatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },

  formatText: {
    fontSize: 12,
    color: '#78350f',
    marginBottom: 6,
  },

  formatCodeBox: {
    backgroundColor: '#fff7ed',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginBottom: 6,
  },

  formatCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#7c2d12',
  },

  formatHint: {
    fontSize: 11,
    color: '#7c2d12',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    maxHeight: '70%',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  modalItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
