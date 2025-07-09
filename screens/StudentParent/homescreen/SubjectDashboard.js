// screens/SubjectDashboard.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function SubjectDashboard() {
  const route = useRoute();
  const {
    subjectName,
    chapters: routeChapters = [],
    announcements: routeAnnouncements = [],
  } = route.params || {};

  const [activeTab, setActiveTab] = useState('Chapters');

  // Fallback dummy data if nothing passed
  const defaultChapters = [
    { id: '1', title: 'Basic of Equation', description: 'Basic of Equation Chapter 1' },
    { id: '2', title: 'Number Systems', description: 'Real Numbers' },
  ];

  const defaultAnnouncements = [
    { id: 'a1', title: 'Exam Date', description: 'Unit test on 5th June' },
    { id: 'a2', title: 'Assignment', description: 'Submit Algebra worksheet by 10th June' },
  ];

  const chapters = routeChapters.length > 0 ? routeChapters : defaultChapters;
  const announcements = routeAnnouncements.length > 0 ? routeAnnouncements : defaultAnnouncements;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {activeTab === 'Chapters' ? 'Chapter Name' : 'Title'}:{' '}
        <Text style={styles.bold}>{item.title}</Text>
      </Text>
      <Text style={styles.cardDesc}>
        {activeTab === 'Chapters' ? 'Chapter Description' : 'Description'}:{' '}
        <Text style={styles.bold}>{item.description}</Text>
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{subjectName}</Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Chapters' && styles.activeTab]}
          onPress={() => setActiveTab('Chapters')}
        >
          <Text style={activeTab === 'Chapters' ? styles.activeText : styles.inactiveText}>Chapters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Announcement' && styles.activeTab]}
          onPress={() => setActiveTab('Announcement')}
        >
          <Text style={activeTab === 'Announcement' ? styles.activeText : styles.inactiveText}>Announcement</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'Chapters' ? chapters : announcements}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#0a5275',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#e0edf5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#0a5275',
  },
  activeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#333',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
  },
  bold: {
    fontWeight: 'bold',
  },
});
