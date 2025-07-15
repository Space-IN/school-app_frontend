import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, StatusBar, Alert
} from 'react-native';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';
import { Picker } from '@react-native-picker/picker';

export default function ClassScheduleViewScreen() {
  const [classList, setClassList] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchSchedule(selectedClass, selectedSection);
    } else {
      setSchedule([]);
    }
  }, [selectedClass, selectedSection]);

  const fetchAssignedClasses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/subject/assigned-classes`);
      setClassList(res.data || []);
    } catch (err) {
      console.error("❌ Error loading class list:", err);
    }
  };

  const fetchSchedule = async (classAssigned, section) => {
    try {
      setLoading(true);
      const encodedClass = encodeURIComponent(classAssigned.trim());
      const encodedSection = encodeURIComponent(section.trim());
      const url = `${BASE_URL}/api/schedule/class/${encodedClass}/section/${encodedSection}`;

      console.log("🚀 Fetching schedule from:", url);
      const res = await axios.get(url);
      setSchedule(res.data.weeklySchedule || []);
    } catch (err) {
      console.error("❌ Error fetching schedule:", err.message, err.response?.data);
      Alert.alert("Error", err.response?.data?.message || "Could not fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📘 View Class Schedule</Text>

      {/* Class Picker */}
      <Text style={styles.label}>Select Class:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedClass}
          style={styles.picker}
          onValueChange={val => {
            setSelectedClass(val);
            setSelectedSection('');
            setSchedule([]);
          }}
        >
          <Picker.Item label="Select Class" value="" />
          {[...new Set(classList.map(i => i.classAssigned))].map((cls, idx) => (
            <Picker.Item key={idx} label={cls.replace('Class ', '')} value={cls} />
          ))}
        </Picker>
      </View>

      {/* Section Picker */}
      <Text style={styles.label}>Select Section:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedSection}
          style={styles.picker}
          onValueChange={val => setSelectedSection(val)}
        >
          <Picker.Item label="Select Section" value="" />
          {[...new Set(classList
            .filter(i => i.classAssigned === selectedClass)
            .map(i => i.section))].map((sec, idx) => (
              <Picker.Item key={idx} label={sec} value={sec} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <Text style={styles.infoText}>⏳ Loading schedule...</Text>
      ) : schedule.length === 0 ? (
        selectedClass && selectedSection ? (
          <Text style={styles.infoText}>📭 No schedule available.</Text>
        ) : (
          <Text style={styles.infoText}>ℹ️ Please select class and section.</Text>
        )
      ) : (
        schedule.map((dayObj, index) => (
          <View key={index} style={styles.dayBlock}>
            <Text style={styles.dayTitle}>{dayObj.day}</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.headerText}>#</Text>
              <Text style={styles.headerText}>Time</Text>
              <Text style={styles.headerText}>Subject</Text>
              <Text style={styles.headerText}>Faculty</Text>
            </View>
            {dayObj.periods.map((period, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.cellText}>{period.periodNumber}</Text>
                <Text style={styles.cellText}>{period.timeSlot}</Text>
                <Text style={styles.cellText}>{period.subjectMasterId?.name || period.subjectMasterId}</Text>
                <Text style={styles.cellText}>{period.facultyId}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    color: '#111827',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 12,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  infoText: {
    marginTop: 20,
    color: '#6b7280',
    textAlign: 'center',
  },
  dayBlock: {
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  dayTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1e40af',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#93c5fd',
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    color: '#1e3a8a',
    fontSize: 14,
  },
  cellText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
});
