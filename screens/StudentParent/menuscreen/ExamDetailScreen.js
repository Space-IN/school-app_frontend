import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExamDetailScreen({ route }) {
  const exam = route.params?.exam;

  if (!exam || !exam.subjects) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No exam details available.</Text>
      </View>
    );
  }

  const renderSubject = ({ item }) => (
    <View style={styles.card}>
      <Ionicons
        name={item.icon || 'book-outline'}
        size={28}
        color="#1e3a8a"
        style={styles.icon}
      />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.classes}>
          📅 {item.date}   🕒 {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{exam.name} ({exam.mode})</Text>
      <FlatList
        data={exam.subjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSubject}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e3a8a', // Purple headline
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#eef2ff', // Light purple card
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  icon: {
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  classes: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'gray',
  },
});
