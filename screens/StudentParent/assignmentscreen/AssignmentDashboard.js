import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';

const subjects = [
  { id: 'math', name: 'Math', icon: 'calculator-outline' },
  { id: 'science', name: 'Science', icon: 'flask-outline' },
  { id: 'english', name: 'English', icon: 'book-outline' },
  { id: 'history', name: 'History', icon: 'time-outline' },
];

const assignmentsData = {
  assigned: {
    math: [
      { id: '1', title: 'Algebra Homework' },
      { id: '2', title: 'Geometry Project' },
    ],
    science: [],
    english: [
      { id: '3', title: 'Essay on Shakespeare' },
    ],
    history: [],
  },
  submitted: {
    math: [
      { id: '10', title: 'Trigonometry Assignment' },
    ],
    science: [
      { id: '11', title: 'Lab Report' },
    ],
    english: [],
    history: [],
  },
};

function AssignmentList({ assignments }) {
  if (assignments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={48} color="#a0a0a0" />
        <Text style={styles.emptyText}>No assignments here.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={assignments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.assignmentCard}>
          <Ionicons name="document-text-outline" size={24} color="#4f46e5" />
          <Text style={styles.assignmentTitle}>{item.title}</Text>
        </View>
      )}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10 }}
    />
  );
}

const AssignedRoute = () => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);

  return (
    <View style={{ flex: 1 }}>
      <SubjectsBar selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />
      <AssignmentList assignments={assignmentsData.assigned[selectedSubject]} />
    </View>
  );
};

const SubmittedRoute = () => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);

  return (
    <View style={{ flex: 1 }}>
      <SubjectsBar selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject} />
      <AssignmentList assignments={assignmentsData.submitted[selectedSubject]} />
    </View>
  );
};

function SubjectsBar({ selectedSubject, setSelectedSubject }) {
  return (
    <View style={styles.subjectsContainer}>
      <FlatList
        data={subjects}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 10 }}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedSubject;
          return (
            <TouchableOpacity
              onPress={() => setSelectedSubject(item.id)}
              style={[
                styles.subjectCard,
                isSelected && styles.subjectCardSelected,
              ]}
            >
              <Ionicons
                name={item.icon}
                size={22}
                color={isSelected ? '#eef2ff' : '#4f46e5'}
              />
              <Text
                style={[
                  styles.subjectText,
                  isSelected && styles.subjectTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export default function AssignmentDashboard() {
  const [index, setIndex] = useState(0);
  const [routes] = React.useState([
    { key: 'assigned', title: 'Assigned' },
    { key: 'submitted', title: 'Submitted' },
  ]);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#4f46e5', height: 3 }}
      style={{ backgroundColor: '#fff' }}
      activeColor="#4f46e5"
      inactiveColor="#888"
      labelStyle={{ fontWeight: 'bold', fontSize: 14 }}
    />
  );

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          assigned: AssignedRoute,
          submitted: SubmittedRoute,
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        renderTabBar={renderTabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  subjectsContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#eef2ff', // light purple background like menu tiles
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    elevation: 1,
  },
  subjectCardSelected: {
    backgroundColor: '#4f46e5', // purple from menu icon
    elevation: 3,
  },
  subjectText: {
    marginLeft: 6,
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 15,
  },
  subjectTextSelected: {
    color: '#eef2ff', // white-ish text on selected purple background
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff', // match menu tile bg
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 1,
  },
  assignmentTitle: {
    marginLeft: 10,
    fontSize: 16,
    color: '#1e3a8a', // dark purple text like menuText
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
});
