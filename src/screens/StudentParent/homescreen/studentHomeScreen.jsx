import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useStudent } from "../../../context/student/studentContext";
import { fetchEvents } from "../../../controllers/studentDataController";
import UserBanner from "../../../components/student/userBanner";
import PerformanceGrid from "../../../components/student/performaceGrid";
import StudentAnnouncements from "../../../components/student/announcements";
import TodaySchedule from "../../../components/student/todaySchedule";
import EventSlider from "../../../components/student/events";




export default function StudentHome() {
  const { studentData, studentLoading, studentErr } = useStudent()
  const [events, setEvents] = useState([])


  useEffect(() => {
    if (!studentData?.userId) {
      setEvents([]); // Clear events if studentId is not available
      return;
    }

    const loadEvents = async () => {
      try {
        const response = await fetchEvents(studentData.userId)
        if(response) setEvents(response)
      } catch(err) {
        console.error("error fetching events.", err)
      }
    }
    loadEvents()
  }, [studentData])

  return (
    <ScrollView style={{ flex: 1, padding: 10, backgroundColor: "#F9FAFB" }}>
      {/* {events.length!==0 && (
        <View style={styles.eventsContainer}>
          <EventSlider events={events} />
        </View>
      )} */}

      <View style={styles.userBannerContainer}>
        <UserBanner studentData={studentData} loading={studentLoading} err={studentErr} />
      </View>
      
      <View style={styles.userPerformanceGrid}>
        <PerformanceGrid />
      </View>

      <View style={styles.announcementsContainer}>
        <StudentAnnouncements  />
      </View>

      <View style={styles.scheduleContainer}>
        <TodaySchedule studentId={studentData?.userId} loading={studentLoading} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  userBannerContainer: {
    width: "100%",
    marginTop: 3,
  },
  userPerformanceGrid: {
    width: "100%",
    marginTop: -4
  },
  announcementsContainer: {
    padding: 2,
    marginTop: 5
  },
  scheduleContainer: {
    padding: 1,
    marginVertical: 15,
    marginBottom: 25,
  },
  eventsContainer: {
    marginBottom: 10
  },
})
