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
  Dimensions,
  AppState,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
 
import { useNavigation } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from "@env";
import { api } from '../../../api/api';

export default function LectureRecordingScreen({ route }) {
  const { facultyId } = route.params || {};
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // ----- schedule/class/subject states -----
  const [scheduleData, setScheduleData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [topicName, setTopicName] = useState("");

  const [loading, setLoading] = useState(false);

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

  // Set header with back button and Past Recordings button
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

  const navigateToPastRecordings = () => {
    if (!selectedClass || !selectedSubject) {
      Alert.alert('Selection Required', 'Please select a class and subject first to view past recordings.');
      return;
    }

    const classInfo = classes.find((c) => c.id === selectedClass);
    navigation.navigate('PastRecordingsScreen', {
      facultyId,
      grade: classInfo.classAssigned,
      section: classInfo.section,
      subjectId: selectedSubject,
    });
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
    if (facultyId) {
      fetchSchedule();
    }
    return () => clearInterval(timerRef.current);
  }, [facultyId]);

  // Fetch faculty schedule
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${BASE_URL}/api/faculty/schedule/faculty/${facultyId}`);
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

  // Auto-select class and subject when classes/scheduleData are available
  useEffect(() => {
    const autoSelectClassAndSubject = () => {
      const { grade, section, subjectId, scheduleItem, subjectName } = route.params || {};
      const effectiveSubjectId = subjectId || scheduleItem?.subjectId;
      
      console.log('🔄 Auto-select started:', { grade, section, effectiveSubjectId, subjectName });
      console.log('📋 Available classes:', classes);
      console.log('📚 Available schedule data count:', scheduleData.length);

      if (!grade || !section) return;

      // Find matching class
      const classId = `${grade}${section}`;
      const matchingClass = classes.find((c) => c.id === classId);
      
      if (!matchingClass) {
        console.log('❌ No matching class found for:', classId);
        return;
      }

      console.log('✅ Matching class found:', matchingClass);

      // Build subjects for the class
      const subjectsForClass = [];
      scheduleData
        .filter((item) => 
          item.classAssigned === matchingClass.classAssigned && 
          item.section === matchingClass.section
        )
        .forEach((item) => {
          console.log('📖 Processing schedule item:', item.classAssigned, item.section);
          if (Array.isArray(item.periods)) {
            item.periods.forEach((period, index) => {
              console.log(`   Period ${index}:`, period);
              if (period.subjectMasterId) {
                let subjId;
                let subjName;

                // Handle different subjectMasterId structures
                if (typeof period.subjectMasterId === 'string') {
                  subjId = period.subjectMasterId;
                  subjName = period.subjectName || 'Unknown Subject';
                } else {
                  // Object case - try multiple possible property names
                  subjId = period.subjectMasterId._id || period.subjectMasterId.id || period.subjectMasterId.subjectMasterId;
                  subjName = period.subjectMasterId.name || period.subjectMasterId.subjectName || 'Unknown Subject';
                }

                if (subjId && !subjectsForClass.find((s) => s.subjectMasterId === subjId)) {
                  subjectsForClass.push({
                    subjectMasterId: subjId,
                    subjectName: subjName,
                  });
                  console.log(`   ✅ Added subject: ${subjName} (${subjId})`);
                }
              }
            });
          }
        });

      // Update subjects state
      setSubjects(subjectsForClass);
      
      // Set selected class
      setSelectedClass(matchingClass.id);
      console.log('🎯 Selected class set to:', matchingClass.id);

      // If we have a subject ID from params, try to match it
      if (effectiveSubjectId) {
        const foundSubject = subjectsForClass.find((s) => 
          s.subjectMasterId === effectiveSubjectId
        );

        if (foundSubject) {
          setSelectedSubject(foundSubject.subjectMasterId);
          console.log('✅ Auto-selected subject by ID:', foundSubject.subjectName, foundSubject.subjectMasterId);
        } else {
          console.log('❌ Subject ID not found. Trying to match by name...');
          
          // If ID doesn't match, try to match by subject name
          const foundByName = subjectsForClass.find((s) => 
            s.subjectName === subjectName || 
            s.subjectName === scheduleItem?.subjectName
          );

          if (foundByName) {
            setSelectedSubject(foundByName.subjectMasterId);
            console.log('✅ Auto-selected subject by name:', foundByName.subjectName, foundByName.subjectMasterId);
          } else {
            console.log('❌ Subject not found by name either. Available subjects:', subjectsForClass);
            setSelectedSubject(null);
          }
        }
      } else {
        console.log('ℹ️ No subject ID provided in params');
        setSelectedSubject(null);
      }
    };

    // Only run when we have all required data
    if (classes.length > 0 && scheduleData.length > 0) {
      autoSelectClassAndSubject();
    }
  }, [classes, scheduleData, route.params]);

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setRecordingUri(null);

    const classInfo = classes.find((c) => c.id === classId);
    if (!classInfo) {
      setSubjects([]);
      setSelectedSubject(null);
      return;
    }

    // Build subjects for the selected class
    const subjectsForClass = [];
    scheduleData
      .filter((item) => 
        item.classAssigned === classInfo.classAssigned && 
        item.section === classInfo.section
      )
      .forEach((item) => {
        if (Array.isArray(item.periods)) {
          item.periods.forEach((period) => {
            if (period.subjectMasterId) {
              let subjId;
              let subjName;

              if (typeof period.subjectMasterId === 'string') {
                subjId = period.subjectMasterId;
                subjName = period.subjectName || 'Unknown Subject';
              } else {
                subjId = period.subjectMasterId._id || period.subjectMasterId.id || period.subjectMasterId.subjectMasterId;
                subjName = period.subjectMasterId.name || period.subjectMasterId.subjectName || 'Unknown Subject';
              }

              if (subjId && !subjectsForClass.find((s) => s.subjectMasterId === subjId)) {
                subjectsForClass.push({
                  subjectMasterId: subjId,
                  subjectName: subjName,
                });
              }
            }
          });
        }
      });

    setSubjects(subjectsForClass);
    
    // Only reset subject if it doesn't belong to the new class
    const currentSubjectStillValid = subjectsForClass.some(
      s => s.subjectMasterId === selectedSubject
    );
    
    if (!currentSubjectStillValid) {
      setSelectedSubject(null);
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubject(subjectId);
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

      const resp = await fetch(`${BASE_URL}/api/faculty/lecture-recordings`, {
        method: 'POST',
        body: form,
      });

      const data = await resp.json();

      if (resp.ok) {
        Alert.alert('Uploaded', 'Recording uploaded successfully with topic.');
        // reset local state
        setRecordingUri(null);
        setTopicName('');
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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar style="light" backgroundColor="#9c1006" />
        
        {/* Custom Header with Back Button and Past Recordings Button */}
        <View style={[styles.customHeader, { paddingTop: insets.top + 15 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.backButtonContainer}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={navigateToPastRecordings}
              style={styles.pastRecordingsButton}
            >
              <Text style={styles.pastRecordingsButtonText}>Past Recordings</Text>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.headerTitle}>
            🎤 Lecture Recording
          </Text>
          <Text style={styles.headerSubtitle}>
            Record and manage your lecture audio
          </Text>
        </View>

        <View style={styles.container}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#4b4bfa" />
            </View>
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

              {renderRecordingControls()}
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
    // backgroundColor: '#bbdbfaff',
  },
  customHeader: {
    paddingVertical: 15,
    backgroundColor: '#9c1006',
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
    justifyContent: 'space-between',
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
  pastRecordingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pastRecordingsButtonText: {
    color: '#fff',
    marginRight: 5,
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
});