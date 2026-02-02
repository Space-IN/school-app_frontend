import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../api/api';

export default function ClassScheduleXLSXUpload() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [allSchedules, setAllSchedules] = useState([]);

  const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
  const SECTION_OPTIONS = ['A', 'B', 'C'];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await api.get(`/api/admin/schedule/all`);
      setAllSchedules(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePickExcel = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    });

    if (result?.assets?.[0]) {
      setSelectedFile(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedClass || !selectedSection || !selectedFile) {
      return Alert.alert('Missing', 'Select class, section and file');
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('classAssigned', selectedClass);
      formData.append('section', selectedSection);
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
      fetchAll();
      Alert.alert('Success', 'Schedule uploaded');
    } catch (err) {
      Alert.alert('Error', 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (cls, section) => {
    Alert.alert(
      'Delete Schedule',
      `Delete schedule for Class ${cls} - ${section}?`,
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/api/admin/schedule/delete`, {
              data: { classAssigned: cls, section },
            });
            fetchAll();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        <View style={styles.card}>
          <Text style={styles.title}>Upload Class Schedule</Text>

          <View style={styles.selectorRow}>
            <View style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>Class</Text>
              <Picker selectedValue={selectedClass} onValueChange={setSelectedClass}>
                <Picker.Item label="Select" value="" />
                {CLASS_OPTIONS.map(c => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>

            <View style={styles.selectorCard}>
              <Text style={styles.selectorLabel}>Section</Text>
              <Picker selectedValue={selectedSection} onValueChange={setSelectedSection}>
                <Picker.Item label="Select" value="" />
                {SECTION_OPTIONS.map(s => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>
          </View>

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
        </View>

        <Text style={styles.sectionTitle}>Existing Schedules</Text>

        {allSchedules.map((s, idx) => (
          <View key={idx} style={styles.scheduleCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Class {s.classAssigned} – {s.section}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(s.classAssigned, s.section)}>
                <Ionicons name="trash-outline" size={20} color="#dc2626" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>

                <View style={styles.tableHeader}>
                  <Text style={[styles.cell, styles.colDay]}>Day</Text>
                  <Text style={[styles.cell, styles.colPeriod]}>Period</Text>
                  <Text style={[styles.cell, styles.colTime]}>Time</Text>
                  <Text style={[styles.cell, styles.colSubject]}>Subject</Text>
                  <Text style={[styles.cell, styles.colFaculty]}>Faculty</Text>
                </View>

                {s.weeklySchedule?.map(day =>
                  day.periods.map((p, i) => (
                    <View key={`${day.day}-${i}`} style={styles.tableRow}>
                      <Text style={[styles.cell, styles.colDay]} numberOfLines={1}>
                        {day.day}
                      </Text>
                      <Text style={[styles.cell, styles.colPeriod]} numberOfLines={1}>
                        {p.periodNumber}
                      </Text>
                      <Text style={[styles.cell, styles.colTime]} numberOfLines={1}>
                        {p.timeSlot}
                      </Text>
                      <Text style={[styles.cell, styles.colSubject]} numberOfLines={1}>
                        {p.subjectName}
                      </Text>
                      <Text style={[styles.cell, styles.colFaculty]} numberOfLines={1}>
                        {p.facultyNames?.length
                          ? p.facultyNames.join(', ')
                          : 'N/A'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 14, backgroundColor: '#f8fafc' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },

  title: { fontSize: 18, color: '#ac1d1dff', fontWeight: '700', marginBottom: 12 },

  selectorRow: { flexDirection: 'row', gap: 12 },

  selectorCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ac1d1dff',
    borderRadius: 10,
    padding: 6,
  },

  selectorLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    marginBottom: -6,
  },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },

  outlineBtn: {
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: '#fd9082',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  primaryBtn: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#fecaca',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  fileChip: { marginTop: 8, color: '#065f46', fontSize: 12 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  cardTitle: { fontWeight: '700' },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fecaca',
    borderRadius: 6,
  },

  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#fecaca',
  },

  cell: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: '#ac1d1dff',
  },

  colDay: { width: 90, fontWeight: '600' },
  colPeriod: { width: 70, textAlign: 'center' },
  colTime: { width: 120 },
  colSubject: { width: 220 },
  colFaculty: { width: 200 },
});
