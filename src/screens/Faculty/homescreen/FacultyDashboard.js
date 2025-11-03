import { StyleSheet, View, FlatList, RefreshControl } from "react-native";
import { useState, useCallback } from 'react';
import FacultyBanner from "../../../components/faculty/facultyBanner";
import FacultyAnnouncements from "../../../components/faculty/facultyAnnouncements";
import FacultyTodaySchedule from "../../../components/faculty/facultyTodaySchedule";

export default function FacultyHomeScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Update the key to force re-render of all components
    setRefreshKey(prevKey => prevKey + 1);
    // Add a small delay to show the refresh animation
    setTimeout(() => {
      setRefreshing(false);
    }, 300);
  }, []);

  const sections = [
    { id: 'banner', component: () => (
      <View style={styles.bannerContainer}>
        <FacultyBanner key={refreshKey} navigation={navigation} />
      </View>
    )},
    { id: 'announcements', component: () => (
      <View style={styles.announcementsContainer}>
        <FacultyAnnouncements key={refreshKey} />
      </View>
    )},
    { id: 'schedule', component: () => (
      <View style={styles.scheduleContainer}>
        <FacultyTodaySchedule key={refreshKey} navigation={navigation} />
      </View>
    )}
  ];

  const renderItem = ({ item }) => item.component();

  return (
    <FlatList
      style={styles.container}
      data={sections}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      scrollEventThrottle={16}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2563eb"]} // Android
          tintColor="#2563eb" // iOS
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#F9FAFB",
  },
  bannerContainer: {
    width: "100%",
    height: 120,
  },
  announcementsContainer: {
    width: "100%",
    marginTop: 20,
  },
  scheduleContainer: {
    width: "100%",
    marginTop: 20,
  },
});