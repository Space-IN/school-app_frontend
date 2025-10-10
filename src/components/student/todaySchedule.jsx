import { useEffect, useMemo, useState, } from "react"
import { fetchStudentSchedule } from "../../controllers/userDataController"
import { ActivityIndicator, View, FlatList, StyleSheet, Dimensions, Text } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome'



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
    const loadSchedule = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log("student id form ts: ", studentId)
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

   const renderItem = ({ item, index }) => (
    <View key={index} style={styles.timelineItem}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineContent}>
            <Text style={styles.timelineTime}>
                {item.periodNumber}. {item.timeSlot}
            </Text>
            <Text style={styles.timelineClass}>
                Subject: {item.subjectMasterId}
            </Text>
            <Text style={styles.faculty}>
                Faculty: {item.facultyId}
            </Text>
        </View>
    </View>
  )

  return (
    <View style={styles.container}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>

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
            <Text style={styles.noDataText}>No classes scheduled for today.</Text>
        ) : (
            <View style={styles.timelineContainer}>
                <FlatList
                    data={todaySchedule.periods}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    scrollEnabled={false}
                />
            </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        width: "95%",
        alignSelf: "center"
    },
    sectionTitle: {
        fontSize: 17.5,
        fontWeight: "900",
        marginVertical: 5,
        color: "#9c1006",
    },
    timelineContainer: {
        marginTop: 10,
        paddingLeft: 10,
        borderLeftWidth: 2,
        borderColor: "#9c1006",
        paddingBottom: 30,
    },
    timelineItem: {
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#9c1006",
        marginRight: 10,
        marginTop: 4,
    },
    timelineContent: { marginLeft: 5 },
    timelineTime: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#9c1006",
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
        fontStyle: "italic",
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
        backgroundColor: "#ffffff",
    },
    noDataText: {
        color: "#64748b",
        fontSize: 14,
        marginLeft: 12,
        marginTop: 8,
    },
})