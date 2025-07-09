import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';

const mockResults = {
  Midterm: {
    examName: 'Midterm Exam',
    subjects: [
      { subject: 'Math', marks: 85, total: 100, grade: 'A' },
      { subject: 'Science', marks: 78, total: 100, grade: 'B+' },
      { subject: 'English', marks: 90, total: 100, grade: 'A+' },
      { subject: 'History', marks: 68, total: 100, grade: 'C' },
    ],
  },
  Final: {
    examName: 'Final Exam',
    subjects: [
      { subject: 'Math', marks: 92, total: 100, grade: 'A+' },
      { subject: 'Science', marks: 81, total: 100, grade: 'A' },
      { subject: 'English', marks: 86, total: 100, grade: 'A' },
      { subject: 'History', marks: 74, total: 100, grade: 'B' },
    ],
  },
  'Unit Exams': null,
  'Other Exams': null,
};

const tabs = ['Midterm', 'Final', 'Unit Exams', 'Other Exams'];

export default function ResultsScreen() {
  const [selectedTab, setSelectedTab] = useState('Midterm');

  const selectedExam = mockResults[selectedTab];

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            selectedTab === tab && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab(tab)}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === tab && styles.activeTabText,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderExamDetails = () => {
    const totalScored = selectedExam.subjects.reduce((sum, s) => sum + s.marks, 0);
    const totalMax = selectedExam.subjects.reduce((sum, s) => sum + s.total, 0);
    const percentage = ((totalScored / totalMax) * 100).toFixed(2);
    const passed = selectedExam.subjects.every((s) => s.marks >= 35);

    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.examName}>{selectedExam.examName} Results</Text>

        <View style={styles.tableHeader}>
          <Text style={[styles.cell, styles.headerCell]}>Subject</Text>
          <Text style={[styles.cell, styles.headerCell]}>Marks</Text>
          <Text style={[styles.cell, styles.headerCell]}>Total</Text>
          <Text style={[styles.cell, styles.headerCell]}>Grade</Text>
        </View>

        {selectedExam.subjects.map((subject, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cell}>{subject.subject}</Text>
            <Text style={styles.cell}>{subject.marks}</Text>
            <Text style={styles.cell}>{subject.total}</Text>
            <Text style={styles.cell}>{subject.grade}</Text>
          </View>
        ))}

        <View style={styles.resultBox}>
          <Text style={styles.resultText}>Total: {totalScored} / {totalMax}</Text>
          <Text style={styles.resultText}>Percentage: {percentage}%</Text>
          <Text style={[styles.resultText, { color: passed ? 'green' : 'red' }]}>Status: {passed ? 'Pass' : 'Fail'}</Text>
        </View>

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Grading Scale & Notes:</Text>
          <Text style={styles.note}>A+ : 90 - 100</Text>
          <Text style={styles.note}>A : 80 - 89</Text>
          <Text style={styles.note}>B+ : 70 - 79</Text>
          <Text style={styles.note}>B : 60 - 69</Text>
          <Text style={styles.note}>C : 50 - 59</Text>
          <Text style={styles.note}>D : 35 - 49 (Pass)</Text>
          <Text style={styles.note}>Fail : Below 35</Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f7' }}>
      {renderTabs()}
      {selectedExam ? (
        renderExamDetails()
      ) : (
        <View style={styles.noResultContainer}>
          <Text style={styles.noResultText}>Results not published yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f4f7',
    flexGrow: 1,
  },
  examName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e0e7ff',
    paddingVertical: 10,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    color: '#1e40af',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
    paddingBottom: 8,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e0f7fa',
    borderRadius: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  noteBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fef9c3',
    borderRadius: 10,
  },
  noteTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#92400e',
  },
  note: {
    fontSize: 14,
    marginBottom: 4,
    color: '#92400e',
  },
  noResultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 18,
    color: 'gray',
  },
});

