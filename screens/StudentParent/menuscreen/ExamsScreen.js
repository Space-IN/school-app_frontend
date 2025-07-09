// screens/ExamsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const examData = [
  {
    id: '1',
    name: 'Midterm Exams',
    mode: 'Offline',
    subjects: [
      {
        id: 'm1',
        name: 'Math',
        date: '2025-06-20',
        time: '10:00 AM',
        icon: 'calculator-outline',
      },
      {
        id: 'm2',
        name: 'Science',
        date: '2025-06-22',
        time: '10:00 AM',
        icon: 'flask-outline',
      },
    ],
  },
  {
    id: '2',
    name: 'Unit Test',
    mode: 'Online',
    subjects: [
      {
        id: 'u1',
        name: 'English',
        date: '2025-06-25',
        time: '2:00 PM',
        icon: 'book-outline',
      },
    ],
  },
];

function ExamList({ exams }) {
  const navigation = useNavigation();

  const renderExam = ({ item }) => (
    <TouchableOpacity
      style={styles.examCard}
      onPress={() => navigation.navigate('ExamDetail', { exam: item })}
    >
      <Ionicons name="document-text-outline" size={28} color="#1e3a8a" />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.examTitle}>{item.name}</Text>
        <Text style={styles.examMode}>{item.mode} Mode</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={exams}
      keyExtractor={(item) => item.id}
      renderItem={renderExam}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

function CompletedExams() {
  return (
    <View style={styles.centered}>
      <Ionicons name="checkmark-done-circle-outline" size={40} color="#a5b4fc" />
      <Text style={{ fontSize: 16, color: '#888', marginTop: 10 }}>
        No completed exams.
      </Text>
    </View>
  );
}

export function ExamDetailScreen({ route }) {
  const { exam } = route.params;

  const renderSubject = ({ item }) => (
    <View style={styles.subjectCard}>
      <Ionicons name={item.icon} size={24} color="#1e3a8a" style={{ marginRight: 12 }} />
      <View>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.subjectInfo}>{item.date} at {item.time}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.detailContainer}>
      <Text style={styles.detailTitle}>{exam.name} ({exam.mode})</Text>
      <FlatList
        data={exam.subjects}
        keyExtractor={(item) => item.id}
        renderItem={renderSubject}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

export default function ExamsScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#4f46e5' },
        tabBarIndicatorStyle: { backgroundColor: '#fff' },
      }}
    >
      <Tab.Screen name="Upcoming" children={() => <ExamList exams={examData} />} />
      <Tab.Screen name="Completed" component={CompletedExams} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 2,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  examMode: {
    fontSize: 14,
    color: '#555',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginVertical: 6,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    elevation: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  subjectInfo: {
    fontSize: 14,
    color: '#555',
  },
});
