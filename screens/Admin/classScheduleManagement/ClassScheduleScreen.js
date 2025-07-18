import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

export default function ClassScheduleXLSXUpload() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [uploading, setUploading] = useState(false);

  const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
  const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

 const validateClassSection = async (cls, section) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/subject/check-class-section`, {
      classAssigned: cls,
      section,
    });

    if (res.data.exists) {
      return true;
    } else {
      Alert.alert('Invalid', 'This Class-Section is not assigned to any faculty.');
      return false;
    }
  } catch (err) {
    const message =
      err.response?.data?.message || 'Could not validate Class-Section combination.';
    Alert.alert('Error', message);
    return false;
  }
};


  const handlePickExcel = async () => {
    const isValid = await validateClassSection(selectedClass, selectedSection);
    if (!isValid) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: true,
      });

      if (result?.assets?.[0]?.uri) {
        const fileUri = result.assets[0].uri;
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const workbook = XLSX.read(base64, { type: 'base64' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const cleanedData = jsonData.map((row) => ({
          day: row.day,
          periodNumber: Number(row.periodNumber),
          timeSlot: row.timeSlot,
          subjectName: row.subjectName?.trim() || null,
          facultyId: typeof row.facultyId === 'string' ? row.facultyId.trim() : '',
        }));

        console.log('✅ Excel Parsed:', cleanedData);
        setExcelData(cleanedData);
      }
    } catch (err) {
      console.error('❌ Error reading Excel file:', err);
      Alert.alert('Error', 'Failed to read Excel file');
    }
  };

  const handleUploadToServer = async () => {
    if (!selectedClass || !selectedSection) {
      return Alert.alert('Validation', 'Please select class and section');
    }

    if (excelData.length === 0) {
      return Alert.alert('No Data', 'Please select an Excel file first');
    }

    try {
      setUploading(true);
      const weeklySchedule = [];
      const groupedByDay = {};


      

      for (const row of excelData) {
        const day = row.day;
        if (!groupedByDay[day]) groupedByDay[day] = [];
const subjectName =
  typeof row.subjectName === 'string' ? row.subjectName.trim() : null;


        const rawFacultyId =
          typeof row.facultyId === 'string' ? row.facultyId.trim() : '';
        if (rawFacultyId === '') {
          console.warn(`⚠️ Skipping row: Missing facultyId on day ${day}`);
          continue;
        }

        groupedByDay[day].push({
          periodNumber: Number(row.periodNumber),
          timeSlot: row.timeSlot,
          subjectName,
          facultyId: rawFacultyId,
        });
      }





      for (const [day, periods] of Object.entries(groupedByDay)) {
        weeklySchedule.push({ day, periods });
      }

      const payload = {
        classAssigned: selectedClass,
        section: selectedSection,
        weeklySchedule,
      };

      const res = await axios.post(`${BASE_URL}/api/schedule/set`, payload);

      console.log('✅ Schedule Saved:', res.data);
      Alert.alert('Success', 'Schedule uploaded and saved successfully!');
      setExcelData([]);
    } catch (err) {
      console.error('❌ Upload error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📂 Upload Class Schedule via Excel (.xlsx)</Text>

      <Text style={styles.label}>Class:</Text>
      <Picker
        selectedValue={selectedClass}
        style={styles.picker}
        onValueChange={(value) => setSelectedClass(value)}
      >
        <Picker.Item label="Select Class" value="" />
        {CLASS_OPTIONS.map((cls, idx) => (
          <Picker.Item key={idx} label={cls} value={cls} />
        ))}
      </Picker>

      <Text style={styles.label}>Section:</Text>
      <Picker
        selectedValue={selectedSection}
        style={styles.picker}
        onValueChange={(value) => setSelectedSection(value)}
      >
        <Picker.Item label="Select Section" value="" />
        {SECTION_OPTIONS.map((sec, idx) => (
          <Picker.Item key={idx} label={sec} value={sec} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handlePickExcel}>
        <Text style={styles.buttonText}>📁 Choose Excel File</Text>
      </TouchableOpacity>

      {excelData.length > 0 && (
        <Text style={{ marginVertical: 10 }}>✅ {excelData.length} rows parsed</Text>
      )}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#10b981' }]}
        onPress={handleUploadToServer}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'Uploading...' : '📤 Upload to Server'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#374151',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    marginVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
