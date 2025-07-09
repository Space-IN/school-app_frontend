// screens/Faculty/classes/AttendanceScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AttendanceScreen({ route }) {
  const { grade } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance for {grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});