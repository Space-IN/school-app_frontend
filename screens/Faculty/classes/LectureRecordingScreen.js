// screens/Faculty/classes/LectureRecordingScreen.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import axios from 'axios';
import BASE_URL from '../../../config/baseURL'; 

export default function LectureRecordingScreen({ route }) {
  const { facultyId } = route.params || {};

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
  const [recordingObj, setRecordingObj] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [timer, setTimer] = useState('00:00');
  const [uploading, setUploading] = useState(false);

  const timerRef = useRef(null);
  const startTsRef = useRef(null);

  useEffect(() => {
    if (facultyId) fetchSchedule();
    return () => clearInterval(timerRef.current);
  }, [facultyId]);

  // ---------- fetch faculty schedule ----------
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/schedule/faculty/${facultyId}`);
      if (res.data && Array.isArray(res.data.schedule)) {
        setScheduleData(res.data.schedule);

        const uniqueClasses = [];
        res.data.schedule.forEach(item => {
          const id = `${item.classAssigned}${item.section}`;
          if (!uniqueClasses.find(c => c.id === id)) {
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

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    setSelectedSubject(null);
    setRecordingUri(null);

    const classInfo = classes.find(c => c.id === classId);
    if (!classInfo) {
      setSubjects([]);
      return;
    }

    const subjectsForClass = [];
    scheduleData
      .filter(item => item.classAssigned === classInfo.classAssigned && item.section === classInfo.section)
      .forEach(item => {
        if (Array.isArray(item.periods)) {
          item.periods.forEach(period => {
            if (period.subjectMasterId && !subjectsForClass.find(s => s.subjectMasterId === period.subjectMasterId._id)) {
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

  // ---------------- recording controls ----------------
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
      setRecordingUri(null);
      startTsRef.current = Date.now();

      let start = Date.now();
      timerRef.current = setInterval(() => {
        const diff = Date.now() - start;
        const s = Math.floor(diff / 1000);
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        setTimer(`${mm}:${ss}`);
      }, 500);
    } catch (err) {
      console.error('startRecording error', err);
      Alert.alert('Unable to start recording');
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
      setRecordingObj(null);
      clearInterval(timerRef.current);
      setTimer('00:00');
      console.log('Recording saved to', uri, 'durationMs:', durationMs);
    } catch (err) {
      console.error('stopRecording error', err);
      Alert.alert('Unable to stop recording');
    }
  };

  // ---------------- upload to backend ----------------
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

      const classInfo = classes.find(c => c.id === selectedClass);
      const subjectInfo = subjects.find(s => s.subjectMasterId === selectedSubject);

      const form = new FormData();
      form.append('facultyId', facultyId);
      form.append('classAssigned', classInfo.classAssigned);
      form.append('section', classInfo.section);
      form.append('subjectMasterId', selectedSubject);
      form.append('subjectName', subjectInfo.subjectName);
      form.append('topicName', topicName); // send topic
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
      setUploading(false);

      if (resp.ok) {
        Alert.alert('Uploaded', 'Recording uploaded with topic.');
        // reset local state
        setRecordingUri(null);
        setSelectedClass(null);
        setSelectedSubject(null);
        setTopicName(""); // reset topic
      } else {
        console.error('Upload error', data);
        Alert.alert('Upload failed', data.message || 'Server error');
      }
    } catch (err) {
      console.error('submitRecording error', err);
      setUploading(false);
      Alert.alert('Upload error');
    }
  };

  // ---------------- UI ----------------
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lecture Recording</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.label}>Select Class:</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={selectedClass} onValueChange={handleClassChange}>
              <Picker.Item label="-- Select Class --" value={null} />
              {classes.map(cls => (
                <Picker.Item key={cls.id} label={`${cls.classAssigned}${cls.section}`} value={cls.id} />
              ))}
            </Picker>
          </View>

          {selectedClass && (
            <>
              <Text style={styles.label}>Select Subject:</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={selectedSubject} onValueChange={(v) => setSelectedSubject(v)}>
                  <Picker.Item label="-- Select Subject --" value={null} />
                  {subjects.map(s => (
                    <Picker.Item key={s.subjectMasterId} label={s.subjectName} value={s.subjectMasterId} />
                  ))}
                </Picker>
              </View>
            </>
          )}

          {/* NEW: Topic Name input */}
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

          {/* Recording controls */}
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            {!isRecording ? (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: selectedClass && selectedSubject ? '#4b4bfa' : '#aaa' }]}
                onPress={startRecording}
                disabled={!selectedClass || !selectedSubject}
              >
                <Text style={styles.buttonText}>Start Recording</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, { backgroundColor: '#d33' }]} onPress={stopRecording}>
                <Text style={styles.buttonText}>Stop Recording</Text>
              </TouchableOpacity>
            )}

            <Text style={{ marginTop: 8 }}>Duration: {timer}</Text>

            {recordingUri && (
              <>
                <Text style={{ marginTop: 12, color: '#333' }}>Local file ready to upload</Text>
                <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745', marginTop: 12 }]} onPress={submitRecording} disabled={uploading}>
                  {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Recording</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { marginTop: 14, fontWeight: '600' },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 8 },
  button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' }
});
