// screens/Faculty/classes/LectureRecordingScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  Dimensions,
  AppState,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import axios from 'axios';
import { TabView } from 'react-native-tab-view';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from '../../../config/baseURL';

const { width: screenWidth } = Dimensions.get('window');

export default function LectureRecordingScreen({ route }) {
  const { facultyId } = route.params || {};
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // ----- Tab Management -----
  const [activeTab, setActiveTab] = useState(0); // 0 = Recording, 1 = Past Recordings

  // ----- schedule/class/subject states -----
  const [scheduleData, setScheduleData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [topicName, setTopicName] = useState("");

  const [loading, setLoading] = useState(false);

  // ----- existing recordings states -----
  const [existingRecordings, setExistingRecordings] = useState([]);
  const [fetchingRecordings, setFetchingRecordings] = useState(false);

  // ----- recording states -----
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingObj, setRecordingObj] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [timer, setTimer] = useState('00:00');
  const [uploading, setUploading] = useState(false);

  const timerRef = useRef(null);
  const startTsRef = useRef(null);
  const pausedDurationRef = useRef(0);

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

  // AppState listener for call interruptions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState.match(/inactive|background/)) {
        // Auto-pause if recording when a call/interruption happens
        if (isRecording && recordingObj && !isPaused) {
          try {
            await recordingObj.pauseAsync();
            setIsRecording(false);
            setIsPaused(true);
            clearInterval(timerRef.current);
            console.log('Recording auto-paused due to app going background/call.');
          } catch (err) {
            console.error('Error auto-pausing recording:', err);
          }
        }
      }

      if (nextState === 'active' && recordingObj && isPaused) {
        // Show alert after returning from call/interruption
        Alert.alert(
          'Recording Interrupted',
          'Your recording was paused. Do you want to resume or end it?',
          [
            {
              text: 'End Recording',
              style: 'destructive',
              onPress: () => stopRecording(),
            },
            {
              text: 'Resume',
              onPress: () => resumeRecording(),
            },
          ]
        );
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isRecording, recordingObj, isPaused]);

  useEffect(() => {
    if (facultyId) fetchSchedule();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId]);

  // Auto-fetch recordings if route params are provided
  useEffect(() => {
    if (
      facultyId &&
      route.params?.grade &&
      route.params?.section &&
      route.params?.subjectMasterId
    ) {
      fetchExistingRecordings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facultyId]);

  // Tab Navigation Functions
  const handleTabPress = (tabIndex) => {
    setActiveTab(tabIndex);
  };

  // Fetch faculty schedule
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/schedule/faculty/${facultyId}`);
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
        const { grade, section, subjectMasterId } = route.params || {};
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

            if (subjectMasterId && subjectsForClass.find((s) => s.subjectMasterId === subjectMasterId)) {
              setSelectedSubject(subjectMasterId);
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
    const { grade, section, subjectMasterId } = route.params || {};

    try {
      setFetchingRecordings(true);

      let apiUrl;
      if (grade && section && subjectMasterId) {
        // Use route params
        apiUrl = `${BASE_URL}/api/lecture-recordings/faculty/${facultyId}/class/${grade}/section/${section}?subjectMasterId=${subjectMasterId}`;
      } else if (selectedClass && selectedSubject) {
        // Use picker selections
        const classInfo = classes.find((c) => c.id === selectedClass);
        apiUrl = `${BASE_URL}/api/lecture-recordings/faculty/${facultyId}/class/${classInfo.classAssigned}/section/${classInfo.section}?subjectMasterId=${selectedSubject}`;
      } else {
        Alert.alert('Please select class and subject first');
        return;
      }

      const response = await axios.get(apiUrl);
      setExistingRecordings(response.data || []);

      // Auto-switch to Past Recordings tab when fetching
      handleTabPress(1);
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
    setRecordingUri(null);
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

  // Enhanced timer function
  const startTimer = () => {
    let start = Date.now();
    timerRef.current = setInterval(() => {
      const diff = Date.now() - start + pausedDurationRef.current;
      const s = Math.floor(diff / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      setTimer(`${mm}:${ss}`);
    }, 500);
  };

  // Recording controls
  const startRecording = async () => {
    if (!selectedClass || !selectedSubject) {
      Alert.alert('Select class and subject first.');
      return;
    }
    if (!topicName.trim()) {
      Alert.alert('Enter Topic', 'Please enter the topic name before recording.');
      return;
    }

    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission required', 'Please allow microphone access.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();

      setRecordingObj(recording);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingUri(null);
      startTsRef.current = Date.now();
      pausedDurationRef.current = 0;

      startTimer();
    } catch (err) {
      console.error('startRecording error', err);
      Alert.alert('Unable to start recording');
    }
  };

  const pauseRecording = async () => {
    try {
      if (!recordingObj || !isRecording) return;

      await recordingObj.pauseAsync();
      setIsRecording(false);
      setIsPaused(true);
      clearInterval(timerRef.current);

      console.log('Recording manually paused.');
    } catch (err) {
      console.error('pauseRecording error', err);
      Alert.alert('Unable to pause recording');
    }
  };

  const resumeRecording = async () => {
    try {
      if (!recordingObj || !isPaused) return;

      const currentTime = timer;
      const [mm, ss] = currentTime.split(':').map(Number);
      pausedDurationRef.current = (mm * 60 + ss) * 1000;

      await recordingObj.startAsync();
      setIsRecording(true);
      setIsPaused(false);

      startTimer();
      console.log('Recording resumed.');
    } catch (err) {
      console.error('resumeRecording error', err);
      Alert.alert('Unable to resume recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingObj) return;
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      const status = await recordingObj.getStatusAsync();
      const durationMs = status.durationMillis || 0;

      setRecordingUri(uri);
      setIsRecording(false);
      setIsPaused(false);
      setRecordingObj(null);
      clearInterval(timerRef.current);
      setTimer('00:00');
      pausedDurationRef.current = 0;
      console.log('Recording saved to', uri, 'durationMs:', durationMs);
    } catch (err) {
      console.error('stopRecording error', err);
      Alert.alert('Unable to stop recording');
    }
  };

  // Upload to backend
  const submitRecording = async () => {
    if (!recordingUri) {
      Alert.alert('No recording', 'Please record before submitting.');
      return;
    }
    if (!selectedClass || !selectedSubject) {
      Alert.alert('Select class and subject');
      return;
    }
    if (!topicName.trim()) {
      Alert.alert('Enter Topic', 'Please enter the topic name.');
      return;
    }

    try {
      setUploading(true);

      const classInfo = classes.find((c) => c.id === selectedClass);
      const subjectInfo = subjects.find((s) => s.subjectMasterId === selectedSubject);

      const form = new FormData();
      form.append('facultyId', facultyId);
      form.append('classAssigned', classInfo.classAssigned);
      form.append('section', classInfo.section);
      form.append('subjectMasterId', selectedSubject);
      form.append('subjectName', subjectInfo.subjectName);
      form.append('topicName', topicName);
      form.append('startTime', new Date(startTsRef.current).toISOString());
      form.append('endTime', new Date().toISOString());

      const filename = `lecture_${Date.now()}.m4a`;
      form.append('audio', {
        uri: recordingUri,
        name: filename,
        type: 'audio/m4a',
      });

      const resp = await fetch(`${BASE_URL}/api/lecture-recordings`, {
        method: 'POST',
        body: form,
      });

      const data = await resp.json();

      if (resp.ok) {
        Alert.alert('Uploaded', 'Recording uploaded with topic.');
        // reset local state
        setRecordingUri(null);
        setTopicName('');
        // Optionally refresh recordings and switch to Past Recordings tab
        if (selectedClass && selectedSubject) {
          fetchExistingRecordings();
        }
      } else {
        console.error('Upload error', data);
        Alert.alert('Upload failed', data.message || 'Server error');
      }
    } catch (err) {
      console.error('submitRecording error', err);
      Alert.alert('Upload error');
    } finally {
      setUploading(false);
    }
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

  // Enhanced recording controls
  const renderRecordingControls = () => {
    return (
      <View style={styles.recordingControls}>
        {/* Start Recording Button */}
        {!isRecording && !isPaused && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: selectedClass && selectedSubject ? '#4b4bfa' : '#aaa' }]}
            onPress={startRecording}
            disabled={!selectedClass || !selectedSubject}
          >
            <Text style={styles.buttonText}>🎤 Start Recording</Text>
          </TouchableOpacity>
        )}

        {/* Pause/Resume/Stop buttons when recording or paused */}
        {(isRecording || isPaused) && (
          <View style={styles.activeRecordingControls}>
            {isRecording && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ff9500', marginRight: 10 }]}
                onPress={pauseRecording}
              >
                <Text style={styles.buttonText}>⏸️ Pause</Text>
              </TouchableOpacity>
            )}

            {isPaused && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#4b4bfa', marginRight: 10 }]}
                onPress={resumeRecording}
              >
                <Text style={styles.buttonText}>▶️ Resume</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#d33' }]}
              onPress={stopRecording}
            >
              <Text style={styles.buttonText}>⏹️ Stop</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Timer Display */}
        <Text style={[styles.timerText, { color: isPaused ? '#ff9500' : '#333' }]}>Duration: {timer} {isPaused && '(Paused)'}</Text>

        {/* Upload button */}
        {recordingUri && (
          <>
            <Text style={styles.readyText}>✅ Recording ready to upload</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#28a745', marginTop: 12 }]}
              onPress={submitRecording}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>📤 Submit Recording</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  // Render Recording Tab Content
  const renderRecordingTab = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.label}>Select Class:</Text>
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
              <Text style={styles.label}>Select Subject:</Text>
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

          {selectedSubject && (
            <>
              <Text style={styles.label}>Enter Topic Name:</Text>
              <TextInput
                style={styles.input}
                value={topicName}
                onChangeText={setTopicName}
                placeholder="Enter today's topic"
              />
            </>
          )}

          {/* Use enhanced recording controls */}
          {renderRecordingControls()}
        </>
      )}
    </View>
  );

  // Render Past Recordings Tab Content
  const renderPastRecordingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.recordingsHeader}>
        <Text style={styles.sectionTitle}>📚 Past Recordings ({existingRecordings.length})</Text>

        {selectedClass && selectedSubject && (
          <TouchableOpacity
            style={[styles.refreshButton]}
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
          {!selectedClass || !selectedSubject ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#4b4bfa', marginTop: 20 }]}
              onPress={() => handleTabPress(0)}
            >
              <Text style={styles.buttonText}>🎤 Go to Recording</Text>
            </TouchableOpacity>
          ) : null}
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
    </View>
  );

  // TabView routes
  const routes = [
    { key: 'record', title: 'Record Lecture' },
    { key: 'past', title: 'Past Recordings' },
  ];

  // renderScene uses our existing render functions
  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'record':
        return renderRecordingTab();
      case 'past':
        return renderPastRecordingsTab();
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
        
        {/* Custom Header with Back Button and Manual Top Safe Area */}
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
             Lecture Recording
          </Text>
          <Text style={styles.headerSubtitle}>
            Record and manage your lecture audio
          </Text>
        </View>

        <View style={styles.container}>
          {/* Keep original tab headers for visual consistency */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 0 && styles.activeTab]}
              onPress={() => handleTabPress(0)}
            >
              <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>🎤 Record Lecture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 1 && styles.activeTab]}
              onPress={() => handleTabPress(1)}
            >
              <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>📚 Past Recordings</Text>
            </TouchableOpacity>
          </View>

          <TabView
            navigationState={{ index: activeTab, routes }}
            renderScene={renderScene}
            onIndexChange={setActiveTab}
            initialLayout={{ width: screenWidth }}
            style={styles.tabView}
            renderTabBar={() => null}
          />
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
    color: '#222',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4b4bfa',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  activeTabText: {
    color: '#fff',
  },
  tabView: {
    flex: 1,
  },
  tabPage: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  recordingControls: {
    marginTop: 14,
    alignItems: 'center',
  },
  activeRecordingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timerText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
  },
  readyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#222',
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
    marginBottom: 10,
  },
});