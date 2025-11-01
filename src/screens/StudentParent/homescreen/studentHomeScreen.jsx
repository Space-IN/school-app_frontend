import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, RefreshControl } from "react-native";
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
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadEvents()

      setRefreshKey(prev => prev+1)
      if(studentData?.userId) {
        const response = await fetchEvents(studentData?.userId)
        if(response) setEvents(response)
      }
    } catch(err) {
      console.error("error refreshing: ", err)
    } finally {
      setRefreshing(false)
    }
  }

  const loadEvents = async () => {
    if(!studentData?.userId) {
      setEvents([])
      return
    }
    try {
      const response = await fetchEvents(studentData.userId)
      if(response) setEvents(response)
    } catch(err) {
      console.error("error fetching events.", err)
    }
  }


  useEffect(() => {
    loadEvents()
  }, [studentData, refreshKey])

  return (
    <ScrollView
      style={{ flex: 1, padding: 10, backgroundColor: "#F9FAFB" }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#9c1006"]}
          tintColor="#9c1006"
          title="refreshing..."
          titleColor="#9c1006"
        />
      }
    >
      {/* {events.length!==0 && (
        <View style={styles.eventsContainer}>
          <EventSlider events={events} />
        </View>
      )} */}

      <View key={`userBanner-${refreshKey}`} style={styles.userBannerContainer}>
        <UserBanner studentData={studentData} loading={studentLoading} err={studentErr} />
      </View>
      
      <View key={`performanceGrid-${refreshKey}`} style={styles.userPerformanceGrid}>
        <PerformanceGrid />
      </View>

      <View key={`announcements-${refreshKey}`} style={styles.announcementsContainer}>
        <StudentAnnouncements  />
      </View>

      <View key={`schedule-${refreshKey}`} style={styles.scheduleContainer}>
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
