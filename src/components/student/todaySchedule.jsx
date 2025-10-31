import { useEffect, useMemo, useState } from "react"
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { fetchStudentSchedule } from "../../controllers/studentDataController"

export default function TodaySchedule({ studentId, studentLoading }) {
  const [todaySchedule, setTodaySchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const today = useMemo(() => {
    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    return days[new Date().getDay()]
  }, [])

  useEffect(() => {
    const loadSchedule = async () => {
        try {
            const scheduleData = await fetchStudentSchedule(studentId)
            const todayData = scheduleData.weeklySchedule?.find(day => day.day === today)
            setTodaySchedule(todayData)
        } catch (err) {
            setError(err.message || "Error fetching schedule")
        } finally {
            setLoading(false)
        }
    }
    
    if (studentId) {
        loadSchedule()
        setLoading(false)
      return
    }
    
  }, [studentId, studentLoading, today])

  const renderItem = ({ item, index }) => (
    <View style={styles.card} key={index}>
        <View style={styles.sessionNum}>
            <Text style={styles.sessionNumText}>{index+1}</Text>
        </View>
        <View style={styles.sessionInfo}>
            <View style={styles.cardHeader}>
                <FontAwesome5 name="clock" size={14} color="#64748b" />
                <Text style={styles.timeText}>{item.timeSlot}</Text>
            </View>

            <Text style={styles.subjectText}>{item.subjectMasterId.name}</Text>

            <View style={styles.facultyRow}>
                <FontAwesome5 name="chalkboard-teacher" size={13} color="#9c1006" />
                <Text style={styles.facultyText}>{item.facultyId}</Text>
            </View>
        </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome5 name="calendar-day" size={16} color="white" />
        <Text style={styles.headerText}>TODAY'S SCHEDULE</Text>
      </View>

      {loading || studentLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#9c1006" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : !todaySchedule || todaySchedule.periods.length === 0 ? (
        <Text style={styles.noDataText}>No classes scheduled for today.</Text>
      ) : (
        <FlatList
          data={todaySchedule.periods}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "95%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    backgroundColor: "#9c1006",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#f5f5f5ff",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    display: "flex",
    flexDirection: "row"
  },
  sessionNum: {
    width: "15%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "#13254bff",
    backgroundColor: "#9c1006",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  sessionNumText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600"
  },
  sessionInfo: {
    padding: 5,
    gap: 3,
    paddingLeft: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#101c2e",
  },
  facultyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  facultyText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 8,
  },
  noDataText: {
    textAlign: "center",
    padding: 20,
    color: "#64748b",
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    padding: 20,
  },
})
