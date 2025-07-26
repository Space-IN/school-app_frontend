import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';

const AttendanceScreen = () => {
  const [groupedAttendance, setGroupedAttendance] = useState([]);

  useEffect(() => {
    fetch('http://10.221.34.143:5000/api/attendance/student/stu009')
      .then((response) => response.json())
      .then((data) => {
        const grouped = groupByDate(data);
        setGroupedAttendance(grouped);
      })
      .catch((error) => {
        console.error('Error fetching attendance:', error);
      });
  }, []);

  const groupByDate = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const dateKey = new Date(item.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return Object.keys(grouped).map((date) => ({
      date,
      records: grouped[date],
    }));
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.text}>📅 Date: {item.date}</Text>
      {item.records.map((record, index) => (
        <View key={index} style={styles.subjectContainer}>
          <Text style={styles.subjectText}>📘 {record.subject}</Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: record.status === 'Present' ? 'green' : 'red' },
              ]}
            />
            <Text style={styles.statusText}>{record.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>📋 Attendance Summary</Text>
      <FlatList
        data={groupedAttendance}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#222',
  },
  subjectContainer: {
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 16,
    color: '#444',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#444',
  },
});

export default AttendanceScreen;
