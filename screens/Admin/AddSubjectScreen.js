// // screens/Admin/AddSubjectScreen.js
// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   TextInput,
//   Button,
//   StyleSheet,
//   Alert,
//   ScrollView,
//   Text,
//   Dimensions,
// } from 'react-native';
// import axios from 'axios';
// import { Picker } from '@react-native-picker/picker';
// import BASE_URL from '../../config/baseURL';

// const AddSubjectScreen = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     classAssigned: '',
//     section: '',
//     facultyId: '',
//     studentId: '',
//   });

//   const [facultyList, setFacultyList] = useState([]);

//   useEffect(() => {
//     const fetchFaculty = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/admin/faculty`);
//         setFacultyList(res.data || []);
//         console.log('📦 Faculty fetched:', res.data);
//       } catch (err) {
//         console.error('❌ Error fetching faculty:', err);
//         Alert.alert('Error', 'Failed to load faculty list');
//       }
//     };
//     fetchFaculty();
//   }, []);

//   const handleChange = (field, value) => {
//     setFormData({ ...formData, [field]: value });
//   };

//   const handleSubmit = async () => {
//     const { name, classAssigned, section, facultyId, studentId } = formData;

//     if (!name || !classAssigned || !section) {
//       Alert.alert('Validation Error', 'Please fill in all required fields.');
//       return;
//     }

//     const payload = {
//       name: name.trim(),
//       classAssigned: classAssigned.trim(),
//       section: section.trim().toUpperCase(),
//       facultyId: facultyId?.trim() || null,
//       studentId: studentId?.trim() || null,
//     };

//     try {
//       console.log('📤 Sending payload:', payload);
//       const response = await axios.post(`${BASE_URL}/api/admin/add-subject`, payload);
//       Alert.alert('✅ Success', response.data.message);

//       setFormData({
//         name: '',
//         classAssigned: '',
//         section: '',
//         facultyId: '',
//         studentId: '',
//       });
//     } catch (err) {
//       console.error('❌ Add Subject Error:', err.response?.data || err.message);
//       Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View style={styles.formContainer}>
//         <Text style={styles.header}>Add Subject</Text>

//         <TextInput
//           placeholder="Subject Name (e.g., Math)"
//           value={formData.name}
//           onChangeText={(text) => handleChange('name', text)}
//           style={styles.input}
//         />

//         <TextInput
//           placeholder="Class Assigned (e.g., 6)"
//           value={formData.classAssigned}
//           onChangeText={(text) => handleChange('classAssigned', text)}
//           style={styles.input}
//           keyboardType="numeric"
//         />

//         <TextInput
//           placeholder="Section (e.g., A)"
//           value={formData.section}
//           onChangeText={(text) => handleChange('section', text)}
//           style={styles.input}
//           autoCapitalize="characters"
//         />

//         <Text style={styles.label}>Assign Faculty (Optional)</Text>
//         <View style={styles.pickerWrapper}>
//           <Picker
//             selectedValue={formData.facultyId}
//             onValueChange={(value) => handleChange('facultyId', value)}
//           >
//             <Picker.Item label="-- Select Faculty --" value="" />
//             {facultyList.map((fac) => (
//               <Picker.Item
//                 key={fac.userId}
//                 label={`${fac.name} (${fac.userId})`}
//                 value={fac.userId}
//               />
//             ))}
//           </Picker>
//         </View>

//         <TextInput
//           placeholder="Assign to Student ID (optional)"
//           value={formData.studentId}
//           onChangeText={(text) => handleChange('studentId', text)}
//           style={styles.input}
//           autoCapitalize="none"
//         />

//         <View style={styles.buttonWrapper}>
//           <Button title="Add Subject" onPress={handleSubmit} color="#1e3a8a" />
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// export default AddSubjectScreen;

// const { width } = Dimensions.get('window');

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     paddingVertical: 30,
//     backgroundColor: '#f0f4ff',
//   },
//   formContainer: {
//     width: width > 400 ? 350 : '90%',
//     alignSelf: 'center',
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#1e3a8a',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#aaa',
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 14,
//     fontSize: 15,
//     backgroundColor: '#f9f9f9',
//   },
//   label: {
//     fontWeight: '600',
//     marginBottom: 6,
//     color: '#1e3a8a',
//   },
//   pickerWrapper: {
//     borderWidth: 1,
//     borderColor: '#aaa',
//     borderRadius: 8,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 14,
//   },
//   buttonWrapper: {
//     marginTop: 10,
//   },
// });
