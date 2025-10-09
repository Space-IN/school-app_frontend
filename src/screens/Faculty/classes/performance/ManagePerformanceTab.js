// // screens/Faculty/classes/performance/ManagePerformanceTab.js
// import React, { useEffect, useState } from 'react';
// import { View, Text, FlatList, StyleSheet } from 'react-native';
// import { Card, FAB } from 'react-native-paper';
// import axios from 'axios';
// import BASE_URL from '../../../../config/baseURL';

// const ManagePerformanceTab = ({ grade, section, navigation }) => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/student/students/all/grade/${grade}/section/${section}`);
//         setStudents(res.data);
//       } catch (err) {
//         console.error('Error fetching students:', err.message);
//         setStudents([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//   }, [grade, section]);

//   return (
//     <View style={styles.container}>
//       {loading ? (
//         <Text>Loading...</Text>
//       ) : students.length === 0 ? (
//         <Text>No students found</Text>
//       ) : (
//         <FlatList
//           data={students}
//           keyExtractor={(item) => item._id}
//           renderItem={({ item }) => (
//             <Card style={styles.card}>
//               <Card.Content>
//                 <Text style={styles.studentName}>{item.name}</Text>
//                 <Text style={styles.subText}>User ID: {item.userId}</Text>
//               </Card.Content>
//             </Card>
//           )}
//         />
//       )}

//       <FAB
//         style={styles.fab}
//         icon="plus"
//         label="Add Marks"
//         onPress={() =>
//           navigation.navigate('StudentSubjectMarksScreen', {
//             grade,
//             section,
//             students,
//           })
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#bbdbfaff',
//     flex: 1,
//   },
//   card: {
//     marginVertical: 6,
//     borderRadius: 12,
//     backgroundColor: '#ffffff',
//     elevation: 2,
//   },
//   studentName: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   subText: {
//     fontSize: 12,
//     color: '#555',
//     marginTop: 2,
//   },
//   fab: {
//     position: 'absolute',
//     right: 16,
//     bottom: 16,
//     backgroundColor: '#4a90e2',
//   },
// });

// export default ManagePerformanceTab;


// screens/Faculty/classes/performance/ManagePerformanceTab.js
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { Card, FAB } from 'react-native-paper';
import axios from 'axios';
import { useAuth } from "../../../../context/authContext";
import { useScrollToTop } from '@react-navigation/native';
import { BASE_URL } from '@env';

const ManagePerformanceTab = ({ grade, section, navigation }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef(null);
  useScrollToTop(listRef);

  useEffect(() => {
    fetchStudents();
  }, [grade, section]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      if (!grade || !section) {
        Alert.alert('Error', 'Class information missing');
        return;
      }

      console.log('Fetching students for:', { grade, section });
      
      const response = await axios.get(
        `${BASE_URL}/api/student/students/all/grade/${grade}/section/${section}`
      );
      
      console.log('Students API response:', response.data);
      setStudents(response.data || []);
      
    } catch (err) {
      console.error('❌ Error fetching students:', err);
      console.error('Error details:', err.response?.data);
      
      Alert.alert('Error', 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleAddMarks = () => {
    if (!students.length) {
      Alert.alert('No Students', 'No students found in this class');
      return;
    }

    navigation.navigate('StudentSubjectMarksScreen', {
      grade,
      section,
      students,
    });
  };

  const renderStudentItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.subText}>User ID: {item.userId}</Text>
        {item.rollNumber && (
          <Text style={styles.subText}>Roll No: {item.rollNumber}</Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4b4bfa" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Students - Class {grade} Section {section}
      </Text>
      
      {students.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No students found in this class.</Text>
          <Text style={styles.emptySubText}>
            Please check if students are assigned to this class section.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={students}
          keyExtractor={(item) => item._id}
          renderItem={renderStudentItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        style={styles.fab}
        icon="plus"
        label="Add Marks"
        onPress={handleAddMarks}
        disabled={students.length === 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#bbdbfaff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  subText: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4a90e2',
  },
});

export default ManagePerformanceTab;