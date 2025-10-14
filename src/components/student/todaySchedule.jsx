import { useEffect, useMemo, useState, } from "react"
import { fetchSchedule } from "../../controllers/userDataController"
import { ActivityIndicator, View, FlatList, StyleSheet, Dimensions, Text } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome'




export default function TodaySchedule({ userId }) {
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
            try {
                const scheduleData = await fetchSchedule(userId)
                console.log("complete schedule data: ", scheduleData?.weeklySchedule[0])
                setTodaySchedule(scheduleData.weeklySchedule?.find(day => day.day === today))
                console.log("today's schedule: ", todaySchedule)
            } catch(err) {
                setError(err)
                console.error("error fetching data: ", err)
            } finally {
                setLoading(false)
            }
        }
        loadSchedule()
    }, [userId])

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>
                Period {item.periodNumber} • {item.timeSlot}
            </Text>
            <Text style={styles.description}>Subject: {item.subjectMasterId}</Text>
            <Text style={styles.description}>Faculty: {item.facultyId}</Text>
        </View>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FontAwesome name="calendar" size={20} color="white" />
                <Text style={styles.heading}>Today's Schedule</Text>
            </View>

            <View style={styles.scheduleContainer}>
                {loading ? (
                    <View style={styles.loadingBox}>
                        <ActivityIndicator size="small" color="#9c1006ff" />
                        <Text style={styles.loadingText}>Loading schedule...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.card}>
                        <Text style={styles.noData}>{error}</Text>
                    </View>
                ) : !todaySchedule ? (
                    <View style={styles.card}>
                        <Text style={styles.noData}>No Schedule found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={todaySchedule.periods}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        style={styles.list}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled={true}
                    />
                )}
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#475569",
    overflow: "hidden",
    marginTop: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#2a3546",
    paddingHorizontal: 20,
  },
  heading: {
    fontWeight: "700",
    marginLeft: 12,
    fontSize: 18,
    color: "white",
  },
  scheduleContainer: {},
  list: {
    maxHeight: Dimensions.get("window").height * 0.35,
    width: "100%",
  },
  card: {
    width: "100%",
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  title: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  description: {
    color: "#DCDCDC",
    fontSize: 12,
  },
  noData: {
    fontSize: 14,
    color: "#DCDCDC",
    paddingVertical: 8,
    alignSelf: "center",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  loadingText: {
    color: "#DCDCDC",
    fontSize: 13,
    marginTop: 4,
  },
})