import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const attendanceData = [
  { id: '1', subject: 'Physics', classesAttended: 19, totalClasses: 20 },
  { id: '2', subject: 'Chemistry', classesAttended: 18, totalClasses: 22 },
  { id: '3', subject: 'Mathematics', classesAttended: 17, totalClasses: 20 },
  { id: '4', subject: 'English', classesAttended: 15, totalClasses: 21 },
  { id: '5', subject: 'Language Option', classesAttended: 19, totalClasses: 24 },
];

export default function AttendanceScreen() {
  const renderItem = ({ item }) => {
    const attendancePercentage =
      item.totalClasses > 0
        ? ((item.classesAttended / item.totalClasses) * 100).toFixed(1)
        : 0;

    const isGood = parseFloat(attendancePercentage) >= 75;

    return (
      <View style={styles.card}>
        <Text style={[styles.itemText, styles.subjectColumn]}>{item.subject}</Text>
        <Text style={[styles.itemText, styles.ratioColumn]}>
          {item.classesAttended}/{item.totalClasses}
        </Text>
        <Text
          style={[
            styles.itemText,
            styles.percentageColumn,
            isGood ? styles.goodAttendance : styles.lowAttendance,
          ]}
        >
          {attendancePercentage}%
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Attendance Status 📊</Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.subjectColumn]}>Subject</Text>
        <Text style={[styles.tableHeaderText, styles.ratioColumn]}>Classes</Text>
        <Text style={[styles.tableHeaderText, styles.percentageColumn]}>%</Text>
      </View>

      <FlatList
        data={attendanceData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff',
    paddingTop: 40,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6a0dad',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '92%',
    backgroundColor: '#d8b4fe',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3b0764',
  },
  list: {
    width: '92%',
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 15,
    color: '#333',
  },
  subjectColumn: {
    flex: 2.5,
    textAlign: 'left',
  },
  ratioColumn: {
    flex: 1.5,
    textAlign: 'center',
  },
  percentageColumn: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  goodAttendance: {
    color: 'green',
  },
  lowAttendance: {
    color: 'red',
  },
});
