// // screens/faculty/FacultyStudentsScreen.js
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   StatusBar,
//   TouchableOpacity,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import axios from 'axios';
// import BASE_URL from '../../../config/baseURL';
// import { useNavigation } from '@react-navigation/native';

// export default function FacultyStudentsScreen({ route }) {
//   const { grade, section = 'A' } = route.params || {};
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigation = useNavigation();

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const fetchStudents = async () => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`
//       );
//       setStudents(response.data);
//     } catch (error) {
//       console.error('Error fetching students:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStudentPress = (student) => {
//     navigation.navigate('StudentProfileScreen', {
//       studentData: student,
//     });
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity onPress={() => handleStudentPress(item)} style={styles.card}>
//       <Text style={styles.studentName}>👤 {item.name}</Text>
//       <Text style={styles.studentId}>🆔 ID: {item.userId}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
//       <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>
//           📚 Students of Class {grade} - Section {section}
//         </Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" style={{ marginTop: 10 }} />
//       ) : (
//         <FlatList
//           data={students}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#bbdbfaff',
//   },
//   header: {
//     paddingVertical: 10,
//     backgroundColor: '#4a90e2',
//     alignItems: 'center',
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//   },
//   headerTitle: {
//     color: '#fff',
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   listContent: {
//     padding: 5,
//   },
//   card: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   studentName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   studentId: {
//     fontSize: 14,
//     marginTop: 5,
//     color: '#555',
//   },
// });


// // screens/faculty/FacultyStudentsScreen.js
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   StyleSheet,
//   StatusBar,
//   TouchableOpacity,
//   Alert
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import axios from 'axios';
// import BASE_URL from '../../../config/baseURL';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { useAuth } from '../../../context/authContext'; // Add this import

// export default function FacultyStudentsScreen() {
//   const route = useRoute();
//   const { grade, section = 'A' } = route.params || {};
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigation = useNavigation();
//   const { user } = useAuth(); // Get user from context

//   useEffect(() => {
//     fetchStudents();
//   }, [grade, section]); // Add dependencies

//   const fetchStudents = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`
//       );
//       setStudents(response.data);
//     } catch (error) {
//       console.error('Error fetching students:', error);
//       Alert.alert('Error', 'Failed to fetch students data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStudentPress = (student) => {
//     navigation.navigate('StudentProfileScreen', {
//       studentData: student,
//     });
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity onPress={() => handleStudentPress(item)} style={styles.card}>
//       <Text style={styles.studentName}>👤 {item.name}</Text>
//       <Text style={styles.studentId}>🆔 ID: {item.userId}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
//       <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>
//           📚 Students of Class {grade} - Section {section}
//         </Text>
//         {/* Optional: Display faculty info from context */}
//         <Text style={styles.facultyInfo}>Faculty: {user?.name}</Text>
//       </View>

//       {loading ? (
//         <ActivityIndicator size="large" style={{ marginTop: 10 }} />
//       ) : (
//         <FlatList
//           data={students}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           contentContainerStyle={styles.listContent}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#bbdbfaff',
//   },
//   header: {
//     paddingVertical: 10,
//     backgroundColor: '#4a90e2',
//     alignItems: 'center',
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//   },
//   headerTitle: {
//     color: '#fff',
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   facultyInfo: {
//     color: '#fff',
//     fontSize: 14,
//     marginTop: 5,
//     opacity: 0.8,
//   },
//   listContent: {
//     padding: 5,
//   },
//   card: {
//     backgroundColor: '#ffffff',
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 12,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//   },
//   studentName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   studentId: {
//     fontSize: 14,
//     marginTop: 5,
//     color: '#555',
//   },
// });



// screens/faculty/FacultyStudentsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { BASE_URL } from '@env';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';

export default function FacultyStudentsScreen() {
  const route = useRoute();
  const { grade, section = 'A' } = route.params || {};
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  // Get the safe area insets
  const insets = useSafeAreaInsets();

  // Set header with back button
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButtonHeader}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonTextHeader}>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    if (grade && section) {
      fetchStudents();
    }
  }, [grade, section]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching students for:', { grade, section });
      
      const response = await axios.get(
        `${BASE_URL}/api/admin/students/grade/${grade}/section/${section}`
      );
      console.log('✅ Students data:', response.data);
      setStudents(response.data);
    } catch (error) {
      console.error('❌ Error fetching students:', error);
      Alert.alert('Error', 'Failed to fetch students data');
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

  const handleStudentPress = (student) => {
    navigation.navigate('StudentProfileScreen', {
      studentData: student,
      grade,
      section,
      facultyId: user?.userId,
      facultyName: user?.name
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleStudentPress(item)} style={styles.card}>
      <Text style={styles.studentName}>👤 {item.name}</Text>
      <Text style={styles.studentId}>🆔 ID: {item.userId}</Text>
      <Text style={styles.studentClass}>📚 Class: {grade} - {section}</Text>
    </TouchableOpacity>
  );

  if (!grade || !section) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
          <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                onPress={handleBackPress}
                style={styles.backButtonContainer}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTitle}>📚 Students</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Class information not available</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" />
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
        
        {/* Custom Header with Back Button and Manual Top Safe Area */}
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.backButtonContainer}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerTitle}>
            📚 Students of Class {grade} - Section {section}
          </Text>
          <Text style={styles.facultyInfo}>
            Faculty: {user?.name} | ID: {user?.userId}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4b4bfa" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item._id || item.userId}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No students found in this class</Text>
                <Text style={styles.emptySubText}>
                  Class {grade} - Section {section} has no enrolled students.
                </Text>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={handleBackPress}
                >
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                  <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  header: {
    paddingVertical: 15,
    backgroundColor: '#4a90e2',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    padding: 5,
  },
  backButtonTextHeader: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  facultyInfo: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4b4bfa',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  studentClass: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
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
    marginBottom: 20,
  },
});