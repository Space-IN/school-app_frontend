// src/screens/Faculty/classes/FacultyClassesScreen.js
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Text,
  Alert,
  RefreshControl 
} from 'react-native';
import axios from 'axios';
import { useAuth } from "../../../context/authContext";
import { useScrollToTop } from '@react-navigation/native';
import { BASE_URL } from '@env'

export default function FacultyClassesScreen({ navigation, route }) {
  const { decodedToken } = useAuth(); // Get user from auth context instead of params
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef(null);
  useScrollToTop(listRef);

  useEffect(() => {
    fetchAssignedClasses();
  }, []);

  const fetchAssignedClasses = async () => {
    try {
      setLoading(true);
      
      // Use user ID from auth context instead of route params
      const facultyId = decodedToken?.userId;
      
      if (!facultyId) {
        Alert.alert('Error', 'User ID not found');
        return;
      }

      console.log('Fetching classes for faculty:', facultyId);
      
      // Option 1: Try using subjects endpoint (more reliable)
      const response = await axios.get(`${BASE_URL}/api/subject/subjects/faculty/${facultyId}`);
      console.log('Subjects API response:', response.data);
      
      let classes = [];
      
      if (response.data && Array.isArray(response.data)) {
        // Extract classes from subjects data
        response.data.forEach(subject => {
          if (subject.classSectionAssignments && Array.isArray(subject.classSectionAssignments)) {
            subject.classSectionAssignments.forEach(assignment => {
              classes.push({
                classAssigned: assignment.classAssigned,
                section: assignment.section,
                subjectName: subject.subjectName,
                subjectId: subject._id || subject.subjectId
              });
            });
          }
        });
        
        // Remove duplicates
        const uniqueClasses = classes.filter((classItem, index, self) => 
          index === self.findIndex(c => 
            c.classAssigned === classItem.classAssigned && 
            c.section === classItem.section
          )
        );
        
        setAssignedClasses(uniqueClasses);
      } else {
        // Option 2: Fallback to schedule endpoint
        await fetchFromScheduleEndpoint(facultyId);
      }
      
    } catch (err) {
      console.error('❌ Error fetching assigned classes:', err);
      console.error('Error details:', err.response?.data);
      
      // Try fallback to schedule endpoint
      if (decodedToken?.userId) {
        await fetchFromScheduleEndpoint(decodedToken.userId);
      } else {
        Alert.alert('Error', 'Failed to load classes');
        setAssignedClasses([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fallback method using schedule endpoint
  const fetchFromScheduleEndpoint = async (facultyId) => {
    try {
      console.log('Trying schedule endpoint for faculty:', facultyId);
      const response = await axios.get(`${BASE_URL}/api/schedule/faculty/${facultyId}`);
      console.log('Schedule API response:', response.data);
      
      const scheduleData = response.data?.schedule || response.data || [];
      const uniqueClasses = [];
      const seen = new Set();

      scheduleData.forEach(item => {
        const key = `${item.classAssigned}-${item.section}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueClasses.push({
            classAssigned: item.classAssigned,
            section: item.section,
            scheduleItem: item
          });
        }
      });

      setAssignedClasses(uniqueClasses);
    } catch (scheduleErr) {
      console.error('❌ Error fetching from schedule endpoint:', scheduleErr);
      throw scheduleErr;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignedClasses();
  };

  const handlePress = (item) => {
  // Since we're inside ClassesStack, we can navigate directly to FacultyClassDashboard
  navigation.navigate('FacultyClassDashboard', {
    grade: item.classAssigned,
    section: item.section,
    scheduleItem: item,
    facultyId: decodedToken?.userId, // Use from auth context
    subjectName: item.subjectName, // Add if available
    subjectId: item.subjectId, // Add if available
  });
};

  const renderClassItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)} style={styles.card}>
      <Text style={styles.classText}>
        Class {item.classAssigned} - Section {item.section}
      </Text>
      {item.subjectName && (
        <Text style={styles.subjectText}>
          Subject: {item.subjectName}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4b4bfa" />
        <Text style={styles.loadingText}>Loading your classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Classes</Text>
      
      {assignedClasses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No classes assigned yet.</Text>
          <Text style={styles.emptySubText}>
            Please contact administration if you believe this is an error.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={assignedClasses}
          keyExtractor={(item, index) => 
            `${item.classAssigned}-${item.section}-${index}`
          }
          renderItem={renderClassItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fdfdfdff' 
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    padding: 16,
    backgroundColor: '#faebebff',
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9c1006',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  classText: { 
    color: '#1e3a8a', 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 4,
  },
  subjectText: {
    color: '#555',
    fontSize: 14,
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});