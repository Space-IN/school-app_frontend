import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FeesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fees Details</Text>
      <Text style={styles.subtitle}>No fee data available currently.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eef2ff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
  },
});
