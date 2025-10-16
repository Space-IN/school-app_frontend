import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import axios from 'axios';
import { BASE_URL } from '@env';

export default function ClassScheduleXLSXUpload() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [allSchedules, setAllSchedules] = useState([]);
  const [expandedSchedules, setExpandedSchedules] = useState({});
  const [showFormat, setShowFormat] = useState(false);


  const CLASS_OPTIONS = Array.from({ length: 10 }, (_, i) => `${i + 1}`);
  const SECTION_OPTIONS = ['A', 'B', 'C', 'D'];

  const toggleExpand = (key) => {
    setExpandedSchedules((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };



  const fetchAll = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/schedule/all`);
      setAllSchedules(res.data);
    } catch (err) {
      console.error("Error fetching schedules:", err.message);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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

      const weeklySchedule = Object.entries(groupedByDay).map(([day, periods]) => ({
        day,
        periods,
      }));

      const payload = {
        classAssigned: selectedClass,
        section: selectedSection,
        weeklySchedule,
      };

      const res = await axios.post(`${BASE_URL}/api/schedule/set`, payload);

      Alert.alert('Success', 'Schedule uploaded and saved successfully!');
      setExcelData([]);
      fetchAll(); // Refresh list after upload
    } catch (err) {
      console.error('❌ Upload error:', err.response?.data || err.message);
      Alert.alert('Error', err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (cls, section) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete schedule for Class ${cls} - Section ${section}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/schedule/delete`, {
                data: { classAssigned: cls, section },
              });
              Alert.alert('Deleted', 'Schedule deleted successfully.');
              fetchAll(); // Refresh list after delete
            } catch (err) {
              console.error('Error deleting schedule:', err.message);
              Alert.alert('Error', 'Could not delete schedule.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.contentWrapper}>
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



          <TouchableOpacity
  style={[styles.button, { backgroundColor: '#f59e0b' }]}
  onPress={() => setShowFormat((prev) => !prev)}
>
  <Text style={styles.buttonText}>
    {showFormat ? "❌ Hide Format" : "👀 View Format"}
  </Text>
</TouchableOpacity>

{showFormat && (
  <View style={styles.formatBox}>
    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
      📑 Required Excel Format: 
    </Text>

    <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
      📑 NOTE :
    </Text>

 
     <Text>The following format should be followed while creating the  schedule if not schedule will not be accepted by the App.</Text>

    {/* Table Header */}
    <View style={styles.tableRow}>
      <Text style={[styles.tableCell, styles.tableHeader]}>day</Text>
      <Text style={[styles.tableCell, styles.tableHeader]}>periodNumber</Text>
      <Text style={[styles.tableCell, styles.tableHeader]}>timeSlot</Text>
      <Text style={[styles.tableCell, styles.tableHeader]}>subjectName</Text>
      <Text style={[styles.tableCell, styles.tableHeader]}>facultyId</Text>
    </View>

    {/* Sample Rows */}
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>Monday</Text>
      <Text style={styles.tableCell}>1</Text>
      <Text style={styles.tableCell}>09:00–09:45</Text>
      <Text style={styles.tableCell}>Mathematics</Text>
      <Text style={styles.tableCell}>FAC123</Text>
    </View>

    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>Monday</Text>
      <Text style={styles.tableCell}>2</Text>
      <Text style={styles.tableCell}>09:45–10:30</Text>
      <Text style={styles.tableCell}>English</Text>
      <Text style={styles.tableCell}>FAC456</Text>
    </View>

    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>Tuesday</Text>
      <Text style={styles.tableCell}>1</Text>
      <Text style={styles.tableCell}>09:00–09:45</Text>
      <Text style={styles.tableCell}>Science</Text>
      <Text style={styles.tableCell}>FAC789</Text>


      
    </View>


    
  </View>
)}














          <Text style={styles.title}>📚 Existing Class Schedules</Text>

          {allSchedules.length === 0 ? (
            <Text>No schedules found</Text>
          ) : (
            allSchedules.map((schedule, idx) => {
              const key = `${schedule.classAssigned}-${schedule.section}`;
              const isExpanded = expandedSchedules[key];

              return (
                <View key={idx} style={styles.scheduleCard}>
                  <Text style={styles.cardTitle}>
                    Class {schedule.classAssigned} - Section {schedule.section}
                  </Text>

                  {isExpanded && (
                    <View style={{ marginTop: 10 }}>
                      {schedule.weeklySchedule.map((dayObj, i) => (
                        <View key={i} style={{ marginBottom: 4 }}>
                          <Text style={styles.dayText}>{dayObj.day}</Text>
                          {dayObj.periods.map((p, j) => (
                            <Text key={j} style={styles.periodText}>
                              Period {p.periodNumber}: {p.timeSlot} — {} ({p.facultyId})
                            </Text>
                          ))}
                        </View>
                      ))}

                      
                    </View>
                  )}

                  <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#dc2626' }]}
                        onPress={() => handleDelete(schedule.classAssigned, schedule.section)}
                      >
                        <Text style={styles.buttonText}>🗑 Delete Schedule</Text>
                      </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#6b7280' }]}
                    onPress={() => toggleExpand(key)}
                  >
                    <Text style={styles.buttonText}>
                      {isExpanded ? '🔼 Less' : '🔽 More'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
    padding: 16,
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: 60,
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
    marginTop: 10,
    borderRadius: 6,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scheduleCard: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: '#f9fafb',
    flexGrow: 1,
    width: '100%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#111827',
  },
  dayText: {
    fontWeight: '600',
    marginTop: 5,
    color: '#374151',
  },
  periodText: {
    marginLeft: 10,
    color: '#4b5563',
  },
formatBox: {
  marginTop: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 8,
  backgroundColor: '#fefce8',
},
tableRow: {
  flexDirection: "row",
  borderBottomWidth: 1,
  borderColor: "#e5e7eb",
},
tableCell: {
  flex: 1,
  padding: 6,
  fontSize: 13,
  color: "#374151",
},
tableHeader: {
  fontWeight: "bold",
  backgroundColor: "#f3f4f6",
  color: "#111827",
},

});
