// src/screens/faculty/facultyHomeScreen.jsx
import { StyleSheet, View } from "react-native";
import FacultyBanner from "../../../components/faculty/facultyBanner";
import FacultyAnnouncements from "../../../components/faculty/facultyAnnouncements";
import FacultyTodaySchedule from "../../../components/faculty/facultyTodaySchedule";

export default function FacultyHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <FacultyBanner navigation={navigation} />
      </View>

      <View style={styles.announcementsContainer}>
        <FacultyAnnouncements />
      </View>

      <View style={styles.scheduleContainer}>
        <FacultyTodaySchedule />
      </View>
    </View>
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
