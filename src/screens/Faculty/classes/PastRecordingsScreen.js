// screens/Faculty/classes/PastRecordingsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "@env";

export default function PastRecordingsScreen({ route }) {
  const { facultyId, grade, section, subjectId } = route.params || {};
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // ----- schedule/class/subject states -----
  const [scheduleData, setScheduleData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [loading, setLoading] = useState(false);

  // ----- existing recordings states -----
  const [existingRecordings, setExistingRecordings] = useState([]);
  const [fetchingRecordings, setFetchingRecordings] = useState(false);

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

  const handleBackPress = () => {
    navigation.goBack();
  };

  useEffect(() => {
    if (facultyId) {
      fetchSchedule();
    }
  }, [facultyId]);

  // Auto-fetch recordings when route params change or selections change
  useEffect(() => {
    if (facultyId && grade && section && subjectId) {
      // Auto-select from route params
      const classId = `${grade}${section}`;
      setSelectedClass(classId);
      setSelectedSubject(subjectId);
      fetchExistingRecordings();
    } else if (selectedClass && selectedSubject) {
      fetchExistingRecordings();
    }
  }, [facultyId, selectedClass, selectedSubject, grade, section, subjectId]);

  // Fetch faculty schedule
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/admin/schedule/faculty/${facultyId}`);
      if (res.data && Array.isArray(res.data.schedule)) {
        setScheduleData(res.data.schedule);

        const uniqueClasses = [];
        res.data.schedule.forEach((item) => {
          const id = `${item.classAssigned}${item.section}`;
          if (!uniqueClasses.find((c) => c.id === id)) {
            uniqueClasses.push({ id, classAssigned: item.classAssigned, section: item.section });
          }
        });
        setClasses(uniqueClasses);

        // If route params included grade/section/subject, auto-select them
        if (grade && section) {
          const matchingClass = uniqueClasses.find(
            (c) => c.classAssigned === grade && c.section === section
          );
          if (matchingClass) {
            setSelectedClass(matchingClass.id);

            // Build subjects for that class and auto-select subject if provided
            const subjectsForClass = [];
            res.data.schedule
              .filter((item) => item.classAssigned === matchingClass.classAssigned && item.section === matchingClass.section)
              .forEach((item) => {
                if (Array.isArray(item.periods)) {
                  item.periods.forEach((period) => {
                    if (
                      period.subjectMasterId &&
                      !subjectsForClass.find((s) => s.subjectMasterId === period.subjectMasterId._id)
                    ) {
                      subjectsForClass.push({
                        subjectMasterId: period.subjectMasterId._id,
                        subjectName: period.subjectMasterId.name,
                      });
                    }
                  });
                }
              });

            setSubjects(subjectsForClass);

            if (subjectId && subjectsForClass.find((s) => s.subjectMasterId === subjectId)) {
              setSelectedSubject(subjectId);
            }
          }
        }
      } else {
        Alert.alert('No schedule found for this faculty.');
      }
    } catch (err) {
      console.error('Fetch schedule error:', err);
      Alert.alert('Error fetching schedule.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingRecordings = async () => {
    try {
      setFetchingRecordings(true);

      let apiUrl;
      if (grade && section && subjectId) {
        // Use route params
        apiUrl = `${BASE_URL}/api/faculty/lecture-recordings/faculty/${facultyId}/class/${grade}/section/${section}?subjectMasterId=${subjectId}`;
      } else if (selectedClass && selectedSubject) {
        // Use picker selections
        const classInfo = classes.find((c) => c.id === selectedClass);
        apiUrl = `${BASE_URL}/api/faculty/lecture-recordings/faculty/${facultyId}/class/${classInfo.classAssigned}/section/${classInfo.section}?subjectMasterId=${selectedSubject}`;
      } else {
        setFetchingRecordings(false);
        return;
      }

      const response = await axios.get(apiUrl);
      setExistingRecordings(response.data || []);
    } catch (err) {
      console.error('❌ Error fetching recordings:', err);
      Alert.alert('Error', 'Failed to fetch lecture recordings.');
    } finally {
      setFetchingRecordings(false);
    }
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedSubject(null);
    setExistingRecordings([]);

    const classInfo = classes.find((c) => c.id === classId);
    if (!classInfo) {
      setSubjects([]);
      return;
    }

    const subjectsForClass = [];
    scheduleData
      .filter((item) => item.classAssigned === classInfo.classAssigned && item.section === classInfo.section)
      .forEach((item) => {
        if (Array.isArray(item.periods)) {
          item.periods.forEach((period) => {
            if (
              period.subjectMasterId &&
              !subjectsForClass.find((s) => s.subjectMasterId === period.subjectMasterId._id)
            ) {
              subjectsForClass.push({
                subjectMasterId: period.subjectMasterId._id,
                subjectName: period.subjectMasterId.name,
              });
            }
          });
        }
      });

    setSubjects(subjectsForClass);
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
    setExistingRecordings([]);
  };

  // Render individual recording item
  const renderRecordingItem = ({ item }) => {
    const createdDate = new Date(item.createdAt).toLocaleDateString();
    const createdTime = new Date(item.createdAt).toLocaleTimeString();

    const getStatusColor = (status) => {
      switch (status) {
        case 'done':
          return '#28a745';
        case 'processing':
          return '#ffc107';
        case 'failed':
          return '#dc3545';
        default:
          return '#6c757d';
      }
    };

    const getRelevanceColor = (isRelevant) => {
      switch (isRelevant) {
        case 'relevant':
          return '#28a745';
        case 'not_relevant':
          return '#dc3545';
        case 'partially_relevant':
          return '#ffc107';
        default:
          return '#6c757d';
      }
    };

    return (
      <View style={styles.recordingItem}>
        <View style={styles.recordingHeader}>
          <Text style={styles.recordingTopic}>{item.topicName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <Text style={styles.recordingInfo}>📅 {createdDate} at {createdTime}</Text>

        {item.score !== null && item.score !== undefined && (
          <Text style={styles.recordingInfo}>
            📊 Relevance Score: {item.score}%
            <Text style={[styles.relevanceLabel, { color: getRelevanceColor(item.isRelevant) }]}> ({item.isRelevant?.replace('_', ' ')})</Text>
          </Text>
        )}

        {item.modelVersion && (
          <Text style={styles.recordingInfo}>🤖 Model: {item.modelVersion}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar style="light" backgroundColor="#9c1006" />
        
        {/* Custom Header with Back Button */}
        <View style={[styles.customHeader, { paddingTop: insets.top + 15 }]}>
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
            📚 Past Recordings
          </Text>
          <Text style={styles.headerSubtitle}>
            View your lecture recordings history
          </Text>
        </View>

        <View style={styles.container}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#4b4bfa" />
            </View>
          ) : (
            <>
              <Text style={styles.label}>Selected Class:</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={selectedClass} onValueChange={handleClassChange}>
                  <Picker.Item label="-- Select Class --" value={null} />
                  {classes.map((cls) => (
                    <Picker.Item key={cls.id} label={`${cls.classAssigned}${cls.section}`} value={cls.id} />
                  ))}
                </Picker>
              </View>

              {selectedClass && (
                <>
                  <Text style={styles.label}>Selected  Subject:</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker selectedValue={selectedSubject} onValueChange={handleSubjectChange}>
                      <Picker.Item label="-- Select Subject --" value={null} />
                      {subjects.map((s) => (
                        <Picker.Item key={s.subjectMasterId} label={s.subjectName} value={s.subjectMasterId} />
                      ))}
                    </Picker>
                  </View>
                </>
              )}

              <View style={styles.recordingsHeader}>
                <Text style={styles.sectionTitle}>
                  📚 Recordings ({existingRecordings.length})
                </Text>

                {selectedClass && selectedSubject && (
                  <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={fetchExistingRecordings}
                    disabled={fetchingRecordings}
                  >
                    {fetchingRecordings ? (
                      <ActivityIndicator size="small" color="#4b4bfa" />
                    ) : (
                      <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {fetchingRecordings ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#4b4bfa" />
                  <Text style={styles.loadingText}>Loading recordings...</Text>
                </View>
              ) : existingRecordings.length === 0 ? (
                <View style={styles.centerContainer}>
                  <Text style={styles.noRecordings}>📝 No recordings found</Text>
                  <Text style={styles.noRecordingsSubtext}>
                    {selectedClass && selectedSubject
                      ? 'No recordings for this class and subject yet.'
                      : 'Please select a class and subject to view recordings.'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={existingRecordings}
                  keyExtractor={(item) => item._id}
                  renderItem={renderRecordingItem}
                  style={styles.recordingsList}
                  refreshControl={
                    <RefreshControl refreshing={fetchingRecordings} onRefresh={fetchExistingRecordings} />
                  }
                  showsVerticalScrollIndicator={false}
                />
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#bbdbfaff',
  },
  customHeader: {
    paddingVertical: 15,
    backgroundColor: '#c01e12ff',
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
  headerSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600',
    color: '#333',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  noRecordings: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  noRecordingsSubtext: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  refreshButton: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#4b4bfa',
    fontWeight: '600',
  },
  recordingsList: {
    marginTop: 10,
  },
  recordingItem: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordingTopic: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  recordingInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  relevanceLabel: {
    fontWeight: '700',
  },
  recordingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});