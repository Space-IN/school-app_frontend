// import React, { useEffect, useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   Platform,
//   StatusBar,
// } from 'react-native';
// import axios from 'axios';
// import { useFocusEffect } from '@react-navigation/native';
// import BASE_URL from '../../config/baseURL';

// export default function AllFacultyScreen({ navigation }) {
//   const [activeTab, setActiveTab] = useState('active');
//   const [facultyList, setFacultyList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const fetchFaculty = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const endpoint =
//         activeTab === 'deleted'
//           ? `${BASE_URL}/api/faculty/deleted`
//           : `${BASE_URL}/api/faculty/all`;

//       const res = await axios.get(endpoint);
//       setFacultyList(res.data || []);
//     } catch (err) {
//       console.error(`❌ Error fetching ${activeTab} faculty:`, err);
//       setError('Failed to load faculty data.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       fetchFaculty();
//     }, [activeTab])
//   );

//   const confirmAction = (title, message, onConfirm) => {
//     Alert.alert(title, message, [
//       { text: 'Cancel', style: 'cancel' },
//       { text: 'Yes', onPress: onConfirm, style: 'destructive' },
//     ]);
//   };

//   const handleSoftDelete = (userId) => {
//     confirmAction('Soft Delete', 'Soft delete this faculty?', async () => {
//       try {
//         await axios.patch(`${BASE_URL}/api/faculty/delete/${userId}`);
//         fetchFaculty();
//         Alert.alert('Deleted', 'Faculty soft deleted');
//       } catch {
//         Alert.alert('Error', 'Failed to soft delete faculty');
//       }
//     });
//   };

//   const handleHardDelete = (userId) => {
//     confirmAction('Delete Permanently', 'This will permanently delete the faculty!', async () => {
//       try {
//         await axios.delete(`${BASE_URL}/api/faculty/${userId}`);
//         fetchFaculty();
//         Alert.alert('Deleted', 'Faculty permanently deleted');
//       } catch {
//         Alert.alert('Error', 'Failed to delete faculty');
//       }
//     });
//   };

//   const handleRestore = (userId) => {
//     confirmAction('Restore Faculty', 'Restore this faculty?', async () => {
//       try {
//         await axios.patch(`${BASE_URL}/api/faculty/restore/${userId}`);
//         fetchFaculty();
//         Alert.alert('Restored', 'Faculty restored successfully');
//       } catch {
//         Alert.alert('Error', 'Failed to restore faculty');
//       }
//     });
//   };

//  const renderFacultyCard = (fac) => (
//   <View key={fac._id} style={styles.facultyCard}>
//     <Text style={styles.name}>{fac.name} ({fac.userId})</Text>

//     {Array.isArray(fac.subjectAssignments) && fac.subjectAssignments.length > 0 && (
//       <>
//         {fac.subjectAssignments.map((subj, index) => (
//           <View key={index} style={{ marginTop: 4 }}>
//             <Text style={styles.meta}>
//               📘 Subject: <Text style={{ fontWeight: 'bold' }}>{subj.subject}</Text>
//             </Text>
//             {subj.assignments.map((a, idx) => (
//               <Text key={idx} style={styles.meta}>
//                 ➤ Class {a.class} - Section {a.section}
//               </Text>
//             ))}
//           </View>
//         ))}
//       </>
//     )}

//     <View style={styles.actionRow}>
//       {activeTab === 'active' ? (
//         <>
//           <Text
//             style={styles.editBtn}
//             onPress={() => navigation.navigate('EditFacultyScreen', { faculty: fac })}
//           >
//             ✏️ Edit
//           </Text>
//           <Text style={styles.softDeleteBtn} onPress={() => handleSoftDelete(fac.userId)}>
//             🗑️ Soft Delete
//           </Text>
//         </>
//       ) : (
//         <>
//           <Text style={styles.restoreBtn} onPress={() => handleRestore(fac.userId)}>
//             🔁 Restore
//           </Text>
//           <Text style={styles.deleteBtn} onPress={() => handleHardDelete(fac.userId)}>
//             ❌ Delete
//           </Text>
//         </>
//       )}
//     </View>
//   </View>
// );




//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.tabRow}>
//         <TouchableOpacity
//           style={[styles.tabBtn, activeTab === 'active' && styles.activeTab]}
//           onPress={() => setActiveTab('active')}
//         >
//           <Text style={styles.tabText}>Active Faculty</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tabBtn, activeTab === 'deleted' && styles.activeTab]}
//           onPress={() => setActiveTab('deleted')}
//         >
//           <Text style={styles.tabText}>Deleted Faculty</Text>
//         </TouchableOpacity>
//       </View>

//       <Text style={styles.heading}>
//         {activeTab === 'active' ? '👩‍🏫 All Active Faculty' : '🗑️ Soft Deleted Faculty'}
//       </Text>

//       {loading ? (
//         <View style={styles.centered}>
//           <ActivityIndicator size="large" color="#1e3a8a" />
//           <Text style={{ marginTop: 10, color: '#1e3a8a' }}>Loading...</Text>
//         </View>
//       ) : error ? (
//         <View style={styles.centered}>
//           <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
//         </View>
//       ) : facultyList.length === 0 ? (
//         <View style={styles.centered}>
//           <Text style={{ fontSize: 16, color: '#666' }}>No data found.</Text>
//         </View>
//       ) : (
//         <ScrollView contentContainerStyle={styles.list}>
//           {facultyList.map(renderFacultyCard)}
//         </ScrollView>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#bbdbfaff',
//     paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//   },
//   tabRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     backgroundColor: '#7fa9ecff',
//     paddingVertical: 10,
//   },
//   tabBtn: {
//     paddingHorizontal: 20,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   activeTab: {
//     backgroundColor: '#bbdbfaff',
//   },
//   tabText: {
//     color: '#000000ff',
//     fontWeight: 'bold',
//   },
//   heading: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1e3a8a',
//     padding: 16,
//   },
//   list: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//   },
//   facultyCard: {
//     backgroundColor: '#fff',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#1e3a8a',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   name: {
//     fontSize: 17,
//     fontWeight: 'bold',
//     color: '#1e3a8a',
//   },
//   meta: {
//     fontSize: 14,
//     color: '#333',
//     marginTop: 2,
//   },
//   actionRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 10,
//   },
//   editBtn: {
//     color: '#0a7',
//     fontWeight: 'bold',
//     marginRight: 15,
//   },
//   softDeleteBtn: {
//     color: '#c96f00',
//     fontWeight: 'bold',
//     marginRight: 15,
//   },
//   restoreBtn: {
//     color: '#007aff',
//     fontWeight: 'bold',
//     marginRight: 15,
//   },
//   deleteBtn: {
//     color: '#d00',
//     fontWeight: 'bold',
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 16,
//   },
// });

// screens/Admin/AllFacultyScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { BASE_URL } from '@env';

export default function AllFacultyScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('active');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFaculty = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint =
        activeTab === 'deleted'
          ? `${BASE_URL}/api/admin/faculty/deleted`
          : `${BASE_URL}/api/admin/faculty/all`;

      const res = await axios.get(endpoint);
      setFacultyList(res.data || []);
    } catch (err) {
      console.error(`❌ Error fetching ${activeTab} faculty:`, err);
      setError('Failed to load faculty data.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFaculty();
    }, [activeTab])
  );

  const confirmAction = (title, message, onConfirm) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: onConfirm, style: 'destructive' },
    ]);
  };

  const handleSoftDelete = (userId) => {
    confirmAction('Soft Delete', 'Soft delete this faculty?', async () => {
      try {
        await axios.patch(`${BASE_URL}/api/admin/faculty/delete/${userId}`);
        fetchFaculty();
        Alert.alert('Deleted', 'Faculty soft deleted');
      } catch {
        Alert.alert('Error', 'Failed to soft delete faculty');
      }
    });
  };

  const handleHardDelete = (userId) => {
    confirmAction(
      'Delete Permanently',
      'This will permanently delete the faculty!',
      async () => {
        try {
          await axios.delete(`${BASE_URL}/api/admin/faculty/${userId}`);
          fetchFaculty();
          Alert.alert('Deleted', 'Faculty permanently deleted');
        } catch {
          Alert.alert('Error', 'Failed to delete faculty');
        }
      }
    );
  };

  const handleRestore = (userId) => {
    confirmAction('Restore Faculty', 'Restore this faculty?', async () => {
      try {
        await axios.patch(`${BASE_URL}/api/admin/faculty/restore/${userId}`);
        fetchFaculty();
        Alert.alert('Restored', 'Faculty restored successfully');
      } catch {
        Alert.alert('Error', 'Failed to restore faculty');
      }
    });
  };

  const renderFacultyCard = (fac) => (
    <TouchableOpacity
      key={fac._id}
      style={styles.facultyCard}
      onPress={() =>
        navigation.navigate('FacultyProfileViewScreen', { userId: fac.userId })
      }
    >
      <Text style={styles.name}>
        {fac.name} ({fac.userId})
      </Text>

      {Array.isArray(fac.subjectAssignments) &&
        fac.subjectAssignments.length > 0 && (
          <>
            {fac.subjectAssignments.map((subj, index) => (
              <View key={index} style={{ marginTop: 4 }}>
                <Text style={styles.meta}>
                  📘 Subject:{' '}
                  <Text style={{ fontWeight: 'bold' }}>{subj.subject}</Text>
                </Text>
                {subj.assignments.map((a, idx) => (
                  <Text key={idx} style={styles.meta}>
                    ➤ Class {a.class} - Section {a.section}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}

      <View style={styles.actionRow}>
        {activeTab === 'active' ? (
          <>
            <Text
              style={styles.editBtn}
              onPress={() =>
                navigation.navigate('EditFacultyScreen', { faculty: fac })
              }
            >
               Edit  Data
             </Text>
            <Text
              style={styles.softDeleteBtn}
              onPress={() => handleSoftDelete(fac.userId)}
            >
              Soft Delete
            </Text>
          </>
        ) : (
          <>
            <Text
              style={styles.restoreBtn}
              onPress={() => handleRestore(fac.userId)}
            >
               Restore
            </Text>
            <Text
              style={styles.deleteBtn}
              onPress={() => handleHardDelete(fac.userId)}
            >
               Delete
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={styles.tabText}>Active Faculty</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'deleted' && styles.activeTab]}
          onPress={() => setActiveTab('deleted')}
        >
          <Text style={styles.tabText}>Deleted Faculty</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.heading}>
        {activeTab === 'active'
          ? '👩‍🏫 All Active Faculty'
          : '🗑️ Soft Deleted Faculty'}
      </Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={{ marginTop: 10, color: '#1e3a8a' }}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={{ color: 'red', fontSize: 16 }}>{error}</Text>
        </View>
      ) : facultyList.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ fontSize: 16, color: '#666' }}>No data found.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {facultyList.map(renderFacultyCard)}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#ec7f7fff',
    paddingVertical: 10,
  },
  tabBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#bbdbfaff',
  },
  tabText: {
    color: '#000000ff',
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    padding: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  facultyCard: {
    backgroundColor: '#faebebff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  meta: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editBtn: {
    color: '#0a7',
    fontWeight: 'bold',
    marginRight: 15,
  },
  softDeleteBtn: {
    color: '#c96f00',
    fontWeight: 'bold',
    marginRight: 15,
  },
  restoreBtn: {
    color: '#007aff',
    fontWeight: 'bold',
    marginRight: 15,
  },
  deleteBtn: {
    color: '#d00',
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

