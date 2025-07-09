import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LeavesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Leaves</Text>
      <Text style={styles.subtitle}>Leave history and requests will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
  },
});
