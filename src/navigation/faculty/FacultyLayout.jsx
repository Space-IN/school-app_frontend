


import React from 'react';
import { View, StyleSheet } from 'react-native';
import FacultyHeader from '../../components/faculty/FacultyHeader';
import FacultyTabs from './FacultyTabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function FacultyLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={[ 'bottom']}>
        <FacultyHeader />
        <View style={styles.content}>
          <FacultyTabs />
        </View>
      </SafeAreaView>
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
