import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  StatusBar,
  ScrollView,
} from 'react-native';
 
import { BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../../context/authContext';
import { Ionicons } from '@expo/vector-icons';
import {api} from '../../../../api/api';

export default function FacultyAttendanceMenuScreen({ route }) {
  const { grade, section, subjectMasterId, facultyId, subjectName, subjectId, board } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [sessionStatus, setSessionStatus] = useState({
    session1: { marked: false, presentCount: 0, totalCount: 0 },
    session2: { marked: false, presentCount: 0, totalCount: 0 },
  });
  const [validSubject, setValidSubject] = useState(null);

  const navigation = useNavigation();
  const { decodedToken } = useAuth();
  const insets = useSafeAreaInsets();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    verifyFacultyAssignment();
    checkSessionStatus();
  }, []);

  // Refresh session status when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkSessionStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const verifyFacultyAssignment = async () => {
    try {
      console.log(' Verifying faculty assignment...');
      const currentFacultyId = decodedToken?.preferred_username || facultyId;

      const response = await api.get(
        `/api/faculty/subject/subjects/faculty/${currentFacultyId}`
      );

      const assignedSubjects = response.data || [];
      const validAssignment = assignedSubjects.find((subject) => {
        const subjectMatch =
          subject._id === subjectMasterId ||
          subject.subjectId === subjectMasterId ||
          subject._id === subjectId;

        if (subjectMatch && subject.classSectionAssignments) {
          return subject.classSectionAssignments.some(
            (assignment) =>
              assignment.classAssigned === grade && assignment.section === section
          );
        }
        return false;
      });

      if (validAssignment) {
        setValidSubject(validAssignment);
      } else {
        Alert.alert(
          'Access Denied',
          `You are not assigned to teach ${subjectName || 'this subject'} in Class ${grade}, Section ${section}.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error(' Error verifying faculty assignment:', error);
    }
  };

  const checkSessionStatus = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];

      // Check both sessions
      const [session1Response, session2Response] = await Promise.all([
        api.get(
          `/api/faculty/attendance/check?grade=${grade}&section=${section}&date=${date}&board=${board}&sessionNumber=1`
        ).catch(() => ({ data: { exists: false } })),
        api.get(
          `/api/faculty/attendance/check?grade=${grade}&section=${section}&date=${date}&board=${board}&sessionNumber=2`
        ).catch(() => ({ data: { exists: false } })),
      ]);

      setSessionStatus({
        session1: {
          marked: session1Response.data.exists || false,
          presentCount: session1Response.data.presentCount || 0,
          totalCount: session1Response.data.totalCount || 0,
        },
        session2: {
          marked: session2Response.data.exists || false,
          presentCount: session2Response.data.presentCount || 0,
          totalCount: session2Response.data.totalCount || 0,
        },
      });
    } catch (error) {
      console.error(' Error checking session status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSession = (sessionNumber) => {
    const session = sessionNumber === 1 ? sessionStatus.session1 : sessionStatus.session2;

    if (session.marked) {
      Alert.alert(
        'Already Marked',
        `Session ${sessionNumber} attendance is already marked for today.\n\nPresent: ${session.presentCount}/${session.totalCount}\n\nWould you like to edit it?`,
        [
          {
            text: 'Edit',
            onPress: () => handleEditAttendance(),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }
const screenName = sessionNumber === 1 
    ? 'FacultyMarkSession1Screen' 
    : 'FacultyMarkSession2Screen';

  navigation.navigate(screenName, {
    grade,
    section,
    board,
    subjectMasterId,
    facultyId,
    subjectName,
    subjectId
    // NO sessionNumber param needed - it's hardcoded in each screen!
  });
};
  const handleEditAttendance = () => {
    navigation.navigate('FacultyEditAttendanceScreen', {
      grade: Number(grade),
      section,
      board,
      subjectName,
      subjectId,
      facultyId: decodedToken?.preferred_username || facultyId,
    });
  };

  const handleViewReport = () => {
    // Navigate to report screen (implement as needed)
    Alert.alert('Coming Soon', 'Attendance report view will be implemented here.');
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />
          <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButtonContainer}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>📋 Attendance Management</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c01e12ff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />

        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButtonContainer}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerText}>📋 Attendance Management</Text>
          <Text style={styles.dateText}>{today}</Text>
          <Text style={styles.classInfo}>
            Class {grade} - Section {section}
            {subjectName && ` | ${subjectName}`}
          </Text>

          {validSubject ? (
            <View style={styles.authorizedContainer}>
              <Text style={styles.authorizedText}> Authorized</Text>
            </View>
          ) : (
            <View style={styles.unauthorizedContainer}>
              <Text style={styles.unauthorizedText}> Verifying...</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Session 1 Button */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              sessionStatus.session1.marked && styles.actionCardMarked,
            ]}
            onPress={() => handleMarkSession(1)}
            disabled={!validSubject}
          >
            <View style={styles.actionCardHeader}>
              <Ionicons
                name={sessionStatus.session1.marked ? 'checkmark-circle' : 'time-outline'}
                size={32}
                color={sessionStatus.session1.marked ? '#4caf50' : '#c01e12ff'}
              />
              <View style={styles.actionCardTitleContainer}>
                <Text style={styles.actionCardTitle}>Mark Session 1</Text>
                <Text style={styles.actionCardSubtitle}>Morning Attendance</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              {sessionStatus.session1.marked ? (
                <View style={styles.statusMarked}>
                  <Text style={styles.statusText}>
                     Marked: {sessionStatus.session1.presentCount}/
                    {sessionStatus.session1.totalCount} Present
                  </Text>
                </View>
              ) : (
                <View style={styles.statusPending}>
                  <Text style={styles.statusText}> Not Marked Yet</Text>
                </View>
              )}
            </View>

            <View style={styles.actionCardFooter}>
              <Text style={styles.actionCardHint}>
                {sessionStatus.session1.marked ? 'Tap to edit' : 'Tap to mark attendance'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Session 2 Button */}
          <TouchableOpacity
            style={[
              styles.actionCard,
              sessionStatus.session2.marked && styles.actionCardMarked,
            ]}
            onPress={() => handleMarkSession(2)}
            disabled={!validSubject}
          >
            <View style={styles.actionCardHeader}>
              <Ionicons
                name={sessionStatus.session2.marked ? 'checkmark-circle' : 'time-outline'}
                size={32}
                color={sessionStatus.session2.marked ? '#4caf50' : '#c01e12ff'}
              />
              <View style={styles.actionCardTitleContainer}>
                <Text style={styles.actionCardTitle}>Mark Session 2</Text>
                <Text style={styles.actionCardSubtitle}>Afternoon Attendance</Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              {sessionStatus.session2.marked ? (
                <View style={styles.statusMarked}>
                  <Text style={styles.statusText}>
                     Marked: {sessionStatus.session2.presentCount}/
                    {sessionStatus.session2.totalCount} Present
                  </Text>
                </View>
              ) : (
                <View style={styles.statusPending}>
                  <Text style={styles.statusText}> Not Marked Yet</Text>
                </View>
              )}
            </View>

            <View style={styles.actionCardFooter}>
              <Text style={styles.actionCardHint}>
                {sessionStatus.session2.marked ? 'Tap to edit' : 'Tap to mark attendance'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Edit Attendance Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.editCard]}
            onPress={handleEditAttendance}
            disabled={!validSubject}
          >
            <View style={styles.actionCardHeader}>
              <Ionicons name="create-outline" size={32} color="#2196f3" />
              <View style={styles.actionCardTitleContainer}>
                <Text style={styles.actionCardTitle}>Edit Past Attendance</Text>
                <Text style={styles.actionCardSubtitle}>Modify previous records</Text>
              </View>
            </View>

            <View style={styles.actionCardFooter}>
              <Text style={styles.actionCardHint}>View and edit attendance history</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* View Report Button
          <TouchableOpacity
            style={[styles.actionCard, styles.reportCard]}
            onPress={handleViewReport}
            disabled={!validSubject}
          >
            <View style={styles.actionCardHeader}>
              <Ionicons name="stats-chart" size={32} color="#ff9800" />
              <View style={styles.actionCardTitleContainer}>
                <Text style={styles.actionCardTitle}>View Report</Text>
                <Text style={styles.actionCardSubtitle}>Attendance statistics</Text>
              </View>
            </View>

            <View style={styles.actionCardFooter}>
              <Text style={styles.actionCardHint}>View detailed attendance reports</Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>
          </TouchableOpacity> */}

          {/* Quick Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Session 1</Text>
                <Text style={styles.summaryValue}>
                  {sessionStatus.session1.marked ? ' Done' : ' Pending'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Session 2</Text>
                <Text style={styles.summaryValue}>
                  {sessionStatus.session2.marked ? 'Done' : ' Pending'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
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
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  headerText: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  dateText: { fontSize: 14, color: '#e0e0ff', marginTop: 4, textAlign: 'center' },
  classInfo: {
    fontSize: 14,
    color: '#e0e0ff',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  authorizedContainer: {
    marginTop: 6,
    padding: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 6,
    alignSelf: 'center',
  },
  authorizedText: { fontSize: 12, color: '#4caf50', fontWeight: '600' },
  unauthorizedContainer: {
    marginTop: 6,
    padding: 4,
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderRadius: 6,
    alignSelf: 'center',
  },
  unauthorizedText: { fontSize: 12, color: '#ff9800', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 30 },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#c01e12ff',
  },
  actionCardMarked: {
    borderLeftColor: '#4caf50',
    backgroundColor: '#f9fff9',
  },
  editCard: {
    borderLeftColor: '#2196f3',
  },
  reportCard: {
    borderLeftColor: '#ff9800',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionCardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actionCardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusMarked: {
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: '#fff3e0',
    padding: 8,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  actionCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionCardHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
});