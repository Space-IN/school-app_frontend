// screens/Faculty/classes/PerformanceScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PerformanceScreen({ route }) {
  const { grade } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance for {grade}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold' },
});