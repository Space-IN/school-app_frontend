// src/navigation/faculty/FacultyLayout.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FacultyHeader from '../../components/faculty/FacultyHeader';
import FacultyTabs from './FacultyTabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function FacultyLayout() {
  return (
    <SafeAreaProvider>
    <View style={styles.container}>
      <FacultyHeader />
      <View style={styles.content}>
        <FacultyTabs />
      </View>
    </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});