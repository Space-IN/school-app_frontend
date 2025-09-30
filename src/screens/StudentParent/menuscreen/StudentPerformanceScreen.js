import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL';

const StudentPerformanceScreen = ({ route }) => {
  const userId = route?.params?.userId || route?.params?.userData?.userId;

  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!userId) {
        console.warn('❌ No userId provided to StudentPerformanceScreen');
        setLoading(false);
        return;
      }

      try {
        console.log('✅ Fetching performance for userId:', userId);
        const response = await axios.get(`${BASE_URL}/api/performance/student/${userId}`);
        const exams = response.data.performances || [];
        setPerformanceData(exams);
        if (exams.length) {
          setSelectedExam(exams[0].examType);
        }
      } catch (error) {
        console.error('❌ Error fetching performance data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [userId]);

  const selectedExamData = performanceData.find((exam) => exam.examType === selectedExam);

  if (loading) {
    return <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 30 }} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {performanceData.length === 0 ? (
          <Text style={styles.noDataText}>No performance data available.</Text>
        ) : (
          <>
            <View style={styles.dropdownContainer}>
              <Text style={styles.label}>Select Exam:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedExam}
                  onValueChange={(value) => setSelectedExam(value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {performanceData.map((exam) => (
                    <Picker.Item key={exam.examType} label={exam.examType} value={exam.examType} />
                  ))}
                </Picker>
              </View>
            </View>

            {selectedExamData && (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.cell, styles.header]}>Subject</Text>
                  <Text style={[styles.cell, styles.header]}>Marks</Text>
                  <Text style={[styles.cell, styles.header]}>Grade</Text>
                  <Text style={[styles.cell, styles.header]}>Status</Text>
                </View>
                {selectedExamData.marks.map((mark, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.cell}>{mark.subject}</Text>
                    <Text style={styles.cell}>{mark.marksObtained}/{selectedExamData.maxMarks}</Text>
                    <Text style={styles.cell}>{mark.grade}</Text>
                    <Text style={[styles.cell, mark.status === 'Pass' ? styles.pass : styles.fail]}>
                      {mark.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default StudentPerformanceScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
    // padding:13,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.05, 
    paddingVertical: 16,
    backgroundColor: '#bbdbfaff',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    color: '#9ca3af',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 24,
    fontWeight: '500',
    color: '#1e2c3fff',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 180 : 50,
    color: '#1e3a8a',
  },
  pickerItem: {
    fontSize: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#65a9fcff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e7ff',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#65a9fcff',
  },
  cell: {
    flex: 1,
    padding: 10,
    fontSize: 13,
    textAlign: 'center',
  },
  header: {
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  pass: {
    color: 'green',
    fontWeight: '600',
  },
  fail: {
    color: 'red',
    fontWeight: '600',
  },
});
