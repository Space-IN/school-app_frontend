import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../../api/api';


import ManagePerformanceTab from './ManagePerformanceTab';
import ViewPerformanceTab from './ViewPerformanceTab';

const Tab = createMaterialTopTabNavigator();

export default function ManagePerformanceTabs({ route, navigation }) {
  const { grade, section, board, subjectName, year } = route.params || {};
  console.log("ManagePerformanceTabs route params: ", route.params)
  const insets = useSafeAreaInsets();

  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTestName, setSelectedTestName] = useState('');

  const [availableYears, setAvailableYears] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableTestNames, setAvailableTestNames] = useState([]);

  const [loadingAssessments, setLoadingAssessments] = useState(true);
  const [errorAssessments, setErrorAssessments] = useState(null);

  const [allAssessmentsData, setAllAssessmentsData] = useState([]);


  const fetchAssessments = async (year, board, grade, section) => {
      try {
          const res = await api.get(
              `/api/student/assessment/`,
              { params: { year, board, grade, section } }
          )
          console.log("response data: ", res.data)
          return res.data
      } catch(err) {
          console.error(`failed to fetch assessment: `, err.response?.data)
          throw err.response?.data || { message: `something went wrong while fetching assessments.` }
      }
  }


  // Effect to fetch all assessments initially
  useEffect(() => {
    const fetchAllAssessments = async () => {
      if (!grade || !section || !board) {
        setErrorAssessments('Missing grade, section or board.');
        setLoadingAssessments(false);
        return;
      }
      try {
        const response = await fetchAssessments(year, board, grade, section); // Fetch all years
        const data = response.data || [];
        console.log("response from manageperformance tabs: ", response)
        setAllAssessmentsData(response);

        // const years = [...new Set(data.map(item => String(new Date(item.date).getFullYear())))].sort((a, b) => b - a);
        // setAvailableYears(years);
        // if (years.length > 0) {
        //   setSelectedYear(years[0]);
        // } else {
        //   setSelectedYear('');
        // }

      } catch (err) {
        setErrorAssessments('Failed to fetch assessments.');
        console.error("failed to fetch assessment: ", err);
      } finally {
        setLoadingAssessments(false);
      }
    };

    fetchAllAssessments();
  }, [grade, section, board]);

  // Effect to update subjects and test names based on selected year
  useEffect(() => {
    console.log("allAssessmentData: ", allAssessmentsData)
    if (allAssessmentsData.length === 0) {
      setAvailableSubjects([]);
      setAvailableTestNames([]);
      setSelectedSubject('');
      setSelectedTestName('');
      return;
    }

    const filteredByYear = allAssessmentsData.exams.filter(item => String(new Date(item.date).getFullYear()) === year);

    const subjects = [...new Set(filteredByYear.map(item => item.subject))];
    setAvailableSubjects(subjects);
    if (subjects.length > 0) {
      console.log("subjects: ", subjects)
      setSelectedSubject(subjects[0]);
    } else {
      setSelectedSubject('');
    }

    const testNames = [...new Set(filteredByYear.map(item => item.test_name))];
    setAvailableTestNames(testNames);
    if (testNames.length > 0) {
      setSelectedTestName(testNames[0]);
    } else {
      setSelectedTestName('');
    }

  }, [allAssessmentsData, selectedYear]);

  // Header Back Button
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

  const handleBackPress = () => navigation.goBack();

  if (loadingAssessments) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />
          <View style={[styles.customHeader, { paddingTop: insets.top + 15 }]}>
            <Text style={styles.headerTitle}>📊 Performance Management</Text>
            <Text style={styles.classInfo}>
              Class {grade} - Section {section}
            </Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading assessments...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (errorAssessments) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
          <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />
          <View style={[styles.customHeader, { paddingTop: insets.top + 15 }]}>
            <Text style={styles.headerTitle}>📊 Performance Management</Text>
            <Text style={styles.classInfo}>
              Class {grade} - Section {section}
            </Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorAssessments}</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#c01e12ff" barStyle="light-content" />

        {/* Custom Header */}
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

          <Text style={styles.headerTitle}>📊 Performance Management</Text>
          <Text style={styles.classInfo}>
            Class {grade} - Section {section}
          </Text>

        </View>

        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
            tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
            tabBarStyle: { backgroundColor: '#fff' },
          }}
        >
          <Tab.Screen
            name="ManagePerformanceTab"
            component={ManagePerformanceTab}
            initialParams={{ grade, section, board, subjectName, navigation, year }}
            options={{ title: 'Manage Performance' }}
          />

          <Tab.Screen
            name="ViewPerformanceTab"
            component={ViewPerformanceTab}
            initialParams={{
              grade,
              section,
              board,
              year: year,
              subjectName: subjectName,
            }}
            options={{ title: 'View Performance' }}
          />
        </Tab.Navigator>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffffff' },
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
  classInfo: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 5,
  },
  picker: {
    flex: 1,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginHorizontal: 5,
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
