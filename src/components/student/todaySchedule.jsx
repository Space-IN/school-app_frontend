import { useEffect, useMemo, useState, } from "react"
import { fetchStudentSchedule } from "../../controllers/studentDataController"
import { ActivityIndicator, View, FlatList, StyleSheet, Text } from "react-native"
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'



export default function TodaySchedule({ studentId }) {
    const [todaySchedule, setTodaySchedule] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const today = useMemo(() => {
        const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]
        return days[new Date().getDay()]
    }, [])



  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      setError("Student ID not available.");
      return;
    }

    const loadSchedule = async () => {
        setLoading(true)
        setError(null)
        try {
            const scheduleData = await fetchStudentSchedule(studentId)
            const todayData = scheduleData.weeklySchedule?.find(day => day.day === today)
            setTodaySchedule(todayData)
        } catch (err) {
            setError(err.message || "Error fetching schedule")
            console.error("Error fetching schedule: ", err)
        } finally {
            setLoading(false)
        }
    }
    loadSchedule()
  }, [studentId, today])

   const renderItem = ({ item }) => (
    <View key={item._id} style={styles.timelineItem}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineContent}>
            <Text style={styles.timelineTime}>
                {item.periodNumber}. {item.timeSlot}
            </Text>
            <Text style={styles.timelineClass}>
                Subject: {item.subjectMasterId.name}
            </Text>
            <Text style={styles.faculty}>
                Faculty: {item.facultyId}
            </Text>
        </View>
    </View>
  )

  return (
    <View style={styles.container}>
        <View style={{ padding: 10, paddingLeft: 20, backgroundColor: "#817f7fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, }}>
            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, width: "50%" }}>
                <FontAwesome5 name="calendar-day" size={19} color="black" />
                <Text style={styles.sectionTitle}>Today's Schedule</Text>
            </View>
        </View>

        {loading ? (
            <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#9c1006ff" />
                <Text style={styles.loadingText}>Loading schedule...</Text>
            </View>
        ) : error ? (
            <View style={styles.card}>
                <Text style={styles.noDataText}>{error}</Text>
            </View>
        ) : !todaySchedule || todaySchedule.periods.length === 0 ? (
            <View style={styles.card}>
                <Text style={styles.noDataText}>No classes scheduled for today.</Text>
            </View>
        ) : (
            <View style={{ padding: 20 }}>
                <View style={styles.timelineContainer}>
                    {todaySchedule.periods.map((item, index) => renderItem({ item, index }))}
                </View>
            </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        width: "95%",
        alignSelf: "center",
        backgroundColor: "#c7c1c1ff",
        marginBottom: 20,
        height: "auto",
        borderRadius:12
    },
    sectionTitle: {
        fontSize: 17.5,
        fontWeight: "900",
        marginVertical: 5,
        color: "black",
    },
    timelineContainer: {
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderColor: "#101c2eff",
    },
    timelineItem: {
        marginBottom: 25,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#101c2eff",
        marginRight: 10,
        marginTop: 4,
        marginLeft: 3
    },
    timelineContent: { marginLeft: 5 },
    timelineTime: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#101c2eff",
    },
    timelineClass: {
        fontSize: 15.5,
        fontWeight: "700",
        color: "#333",
    },
    faculty: {
        fontSize: 14,
        fontWeight: "500",
        color: "#64748b",
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
    card: {
        width: "100%",
        padding: 16,
        backgroundColor: "#e7e0e0ff",
        borderRadius: 12,
    },
    noDataText: {
        color: "#64748b",
        fontSize: 14,
        marginLeft: 12,
        marginTop: 8,
    },
    errorText: {
        color: "#f12a2aff",
        fontSize: 14,
        marginLeft: 12,
        marginTop: 8,
    },
})
