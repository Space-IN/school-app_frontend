// screens/Faculty/classes/performance/FacultyPerformanceScreen.js
import React, { useState } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import ManagePerformanceTab from './performance/ManagePerformanceTab';
import ViewPerformanceTab from './performance/ViewPerformanceTab';

const FacultyPerformanceScreen = ({ route, navigation }) => {
  const { grade, section, studentId } = route.params; // ✅ Extract studentId
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'manage', title: 'Manage Performance' },
    { key: 'view', title: 'View Performance' },
  ]);

  const renderScene = SceneMap({
    manage: () => (
      <ManagePerformanceTab
        grade={grade}
        section={section}
        studentId={studentId} // ✅ Pass studentId
        navigation={navigation}
      />
    ),
    view: () => (
      <ViewPerformanceTab
        grade={grade}
        section={section}
        studentId={studentId} // ✅ Pass studentId
        navigation={navigation}
      />
    ),
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: '#6200ee' }}
          style={{ backgroundColor: '#fff' }}
          activeColor="#6200ee"
          inactiveColor="#777"
        />
      )}
    />
  );
};

export default FacultyPerformanceScreen;
