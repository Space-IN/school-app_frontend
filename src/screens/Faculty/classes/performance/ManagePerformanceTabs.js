// import React from 'react';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import ManagePerformanceTab from './ManagePerformanceTab';
// import ViewPerformanceTab from './ViewPerformanceTab';

// const Tab = createMaterialTopTabNavigator();

// export default function ManagePerformanceTabs({ route }) {
//   const { grade, section, student } = route.params; 
//   const studentId = student?.userId || null;

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarActiveTintColor: '#007AFF',
//         tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
//         tabBarIndicatorStyle: { backgroundColor: '#007AFF' },
//       }}
//     >
//       <Tab.Screen
//         name="ManagePerformanceTab"
//         component={ManagePerformanceTab}
//         initialParams={{ grade, section }}
//         options={{ title: 'Manage Performance' }}
//       />
//       <Tab.Screen
//         name="ViewPerformanceTab"
//         component={ViewPerformanceTab}
//         initialParams={{ 
//           studentId,
//           classAssigned: grade, 
//           section 
//         }}
//         options={{ title: 'View Performance' }}
//       />
//     </Tab.Navigator>
//   );
// }

// screens/Faculty/classes/performance/ManagePerformanceTabs.js
import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text
} from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// ✅ FIXED IMPORTS — make sure file names match exactly in your folder:
import ManagePerformanceTab from './ManagePerformanceTab';
import ViewPerformanceTab from './ViewPerformanceTab';

const Tab = createMaterialTopTabNavigator();

export default function ManagePerformanceTabs({ route, navigation }) {
  const { grade, section, student } = route.params || {};
  const studentId = student?.userId || null;
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
        <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />

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
            {student && ` | Student: ${student.name}`}
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
            initialParams={{ grade, section, navigation }}
            options={{ title: 'Manage Performance' }}
          />
          <Tab.Screen
            name="ViewPerformanceTab"
            component={ViewPerformanceTab}
            initialParams={{
              studentId,
              grade,
              section,
            }}
            options={{ title: 'View Performance' }}
          />
        </Tab.Navigator>
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
  classInfo: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
});
