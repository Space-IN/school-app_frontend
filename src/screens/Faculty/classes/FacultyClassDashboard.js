import React, { useLayoutEffect, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  BackHandler,
  Alert,
  ActivityIndicator,
  StatusBar 
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from "../../../context/authContext";
import { BASE_URL } from '@env';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FacultyClassDashboard({ route }) {
  const { decodedToken } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Get all params with proper fallbacks
  const { 
    grade, 
    section, 
    subjectName, 
    subjectId,
    redirectedFromHome,
    scheduleItem 
  } = route.params || {};
  console.log("class dashboard route params: ", route.params)

  const [loading, setLoading] = useState(false);
  const [classInfo, setClassInfo] = useState(null);

  // Use facultyId from auth context instead of params
  const facultyId = decodedToken?.userId;

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

  // Debug: Check what params we're receiving
  useEffect(() => {
    console.log('📱 FacultyClassDashboard - Received Params:', {
      grade,
      section,
      facultyId, // Now from context
      subjectName,
      subjectId,
      redirectedFromHome
    });

    if (!grade || !section) {
      Alert.alert('Error', 'Class information missing. Please go back and try again.');
      return;
    }
  }, [route.params, facultyId]);

  useLayoutEffect(() => {
    navigation.setOptions({ 
      title: `Class ${grade} - Section ${section}` 
    });
  }, [navigation, grade, section]);

  // Simplified data fetching
  useEffect(() => {
    const initializeClassData = async () => {
      if (!grade || !section) return;

      setLoading(true);
      try {
        // Option 1: If you need schedule data
        if (!scheduleItem) {
          const response = await fetch(
            `${BASE_URL}/api/schedule/class/${grade}/section/${section}`
          );
          const data = await response.json();
          console.log('📦 Schedule Data:', data);
          setClassInfo(data);
        } else {
          setClassInfo(scheduleItem);
        }
      } catch (error) {
        console.error('❌ Error fetching class data:', error);
        // Continue even if schedule fails - not critical for dashboard
      } finally {
        setLoading(false);
      }
    };

    initializeClassData();
  }, [grade, section, scheduleItem]);

  useFocusEffect(
    React.useCallback(() => {
      const onBack = () => {
        if (redirectedFromHome) {
          navigation.navigate('FacultyTabs', {
            screen: 'Home',
          });
          return true;
        }
        navigation.goBack();
        return true;
      };
      
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [redirectedFromHome, navigation])
  );

  const sections = [
    { 
      title: 'Students', 
      icon: 'people', 
      screen: 'FacultyStudentsScreen',
      requiredParams: ['grade', 'section']
    },
    { 
      title: 'Attendance', 
      icon: 'clipboard', 
      screen: 'FacultyMarkAttendanceScreen',
      requiredParams: ['grade', 'section', 'subjectId', 'subjectName']
    },
    { 
      title: 'Performance', 
      icon: 'bar-chart', 
      screen: 'FacultyPerformanceScreen',
      requiredParams: ['grade', 'section', 'subjectId', 'subjectName']
    },
    { 
      title: 'This Class Schedule', 
      icon: 'calendar', 
      screen: 'ClassScheduleScreen',
      requiredParams: ['grade', 'section']
    },
    { 
      title: 'Lecture Recording', 
      icon: 'videocam', 
      screen: 'LectureRecordingScreen',
      requiredParams: ['grade', 'section', 'subjectId']
    },
    { 
      title: 'Chapters', 
      icon: 'book', 
      screen: 'FacultyChaptersScreen',
      requiredParams: ['grade', 'section', 'subjectId']
    },
  ];

  const handleCardPress = (screen, requiredParams) => {
    console.log('🧭 Navigating to:', screen);
    
    // Check if we have all required parameters
    const missingParams = requiredParams.filter(param => {
      if (param === 'facultyId') {
        return !facultyId;
      }
      return !route.params[param];
    });
    
    if (missingParams.length > 0) {
      Alert.alert(
        'Information Missing', 
        `Cannot open ${screen}. Missing: ${missingParams.join(', ')}`
      );
      return;
    }

    // Prepare navigation params - use facultyId from context
    const navParams = {
      grade,
      section,
      facultyId,
      subjectId,
      subjectName,
      year: new Date().getFullYear(),
      ...route.params
    };

    console.log('➡️ Navigation Params:', navParams);

    navigation.navigate(screen, navParams);
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                onPress={handleBackPress}
                style={styles.backButtonContainer}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.classTitle}>
              Class {grade} - Section {section}
            </Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4b4bfa" />
            <Text style={styles.loadingText}>Loading Class Dashboard...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!grade || !section) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                onPress={handleBackPress}
                style={styles.backButtonContainer}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.classTitle}>Class Dashboard</Text>
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
        
        {/* Class Header Info with Back Button */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.backButtonContainer}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.classTitle}>
            Class {grade} - Section {section}
          </Text>
          {subjectName && (
            <Text style={styles.subjectTitle}>
              Subject: {subjectName}
            </Text>
          )}
          <Text style={styles.facultyInfo}>
            Faculty: {decodedToken?.name} (ID: {facultyId})
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.cardsContainer}>
          {sections.map((sec) => (
            <TouchableOpacity
              key={sec.title}
              onPress={() => handleCardPress(sec.screen, sec.requiredParams)}
              style={styles.card}
            >
              <Ionicons name={sec.icon} size={32} color="#c01e12ff" style={{ marginBottom: 8 }} />
              <Text style={styles.cardTitle}>{sec.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
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
  classTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subjectTitle: {
    fontSize: 16,
    color: '#e0e0ff',
    textAlign: 'center',
    marginTop: 5,
  },
  facultyInfo: {
    fontSize: 14,
    color: '#e0e0ff',
    textAlign: 'center',
    marginTop: 5,
    fontStyle: 'italic',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  card: {
    backgroundColor: '#faebebff',
    width: '47%',
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});