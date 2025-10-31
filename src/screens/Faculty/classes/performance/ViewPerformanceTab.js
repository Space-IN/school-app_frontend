//src\screens\Faculty\classes\performance\ViewPerformanceTab.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from '@env';

const ViewPerformanceTab = ({ route }) => {
  const { grade, section } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState('');
  const [allPerformances, setAllPerformances] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamTypesAndData = async () => {
      try {
        const typesRes = await axios.get(
          `${BASE_URL}/api/performance/types/all/class/${grade}/section/${section}`
        );

        const types = typesRes.data.examTypes;
        setExamTypes(types);
        setSelectedExamType(types[0] || '');

        const performanceResults = {};

        for (const examType of types) {
          const encodedType = encodeURIComponent(examType.trim());
          const res = await axios.get(
            `${BASE_URL}/api/performance/class/${grade}/section/${section}/exam/${encodedType}`
          );

          performanceResults[examType] = res.data.performances || [];
        }

        setAllPerformances(performanceResults);
      } catch (err) {
        console.error('❌ Error:', err);
        setError('Failed to fetch performance data.');
      } finally {
        setLoading(false);
      }
    };

    if (grade && section) {
      fetchExamTypesAndData();
    } else {
      setError('Missing class or section');
      setLoading(false);
    }
  }, [grade, section]);

  const renderPerformanceCard = (item) => (
    <View key={item._id} style={styles.card}>
      <Text style={styles.studentName}>🎓 {item.studentName || item.studentId}</Text>
      <Text style={styles.subText}>Max Marks: {item.maxMarks}</Text>
      {item.marks.map((mark, idx) => (
        <Text key={idx} style={styles.markItem}>
          📘 {mark.subject}: {mark.marksObtained} / {item.maxMarks}
        </Text>
      ))}
      {/* Updated percentage, grade, and status check */}
      {item.percentage !== undefined && item.percentage !== null ? (
        <>
          <Text style={styles.subText}>📊 Percentage: {item.percentage.toFixed(2)}%</Text>
          <Text style={styles.subText}>🎖️ Grade: {item.grade || 'N/A'}</Text>
          <Text
            style={[
              styles.subText,
              { color: item.status === 'Pass' ? 'green' : 'red', fontWeight: 'bold' },
            ]}
          >
            ✅ Status: {item.status || 'N/A'}
          </Text>
        </>
      ) : (
        <Text style={styles.subText}>📊 Percentage, grade, and status not available</Text>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;
  }

  if (error) {
    return <Text style={styles.emptyText}>{error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.examHeader}>Select Exam Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedExamType}
          onValueChange={(value) => setSelectedExamType(value)}
          style={styles.picker}
        >
          {examTypes.map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      {selectedExamType ? (
        <>
          <Text style={styles.examHeader}>{selectedExamType}</Text>
          {allPerformances[selectedExamType] && allPerformances[selectedExamType].length > 0 ? (
            allPerformances[selectedExamType].map((item) => renderPerformanceCard(item))
          ) : (
            <Text style={styles.emptyText}>No data for {selectedExamType}</Text>
          )}
        </>
      ) : (
        <Text style={styles.emptyText}>Please select an exam type</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#bbdbfaff',
    flex: 1,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  examHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
  markItem: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 10,
  },
});

export default ViewPerformanceTab;
