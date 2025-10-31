import { StyleSheet, Text, View, ActivityIndicator } from "react-native"
import Foundation from "@expo/vector-icons/Foundation"
import FontAwesome5 from "@expo/vector-icons/FontAwesome5"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { fetchAnnouncements } from "../../controllers/studentDataController"
import { endOfWeek, parseISO, startOfWeek, isWithinInterval } from "date-fns"


export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  let thisWeekAnnouncements = []

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true)
      try {
        const response = await fetchAnnouncements()
        if (response) setAnnouncements(response)
        
        thisWeekAnnouncements = announcements.filter((item) => {
            const announcementDate = parseISO(item.date)
            const now = new Date()

            return isWithinInterval(announcementDate, {
                start: startOfWeek(now, { weekStartsOn: 1 }),
                end: endOfWeek(now, { weekStartsOn: 1 }),
            })
        })
      } catch (err) {
        setErr(err.message || "An error occurred while fetching announcements.")
      } finally {
        setLoading(false)
      }
    }
    loadAnnouncements()
  }, [])

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Foundation name="megaphone" size={21} color="white" />
            <Text style={styles.heading}>ANNOUNCEMENTS</Text>
        </View>

        <View style={styles.announcementsContainer}>
            {loading ? (
            <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#9c1006" />
                <Text style={styles.loadingText}>Loading announcements...</Text>
            </View>
            ) : err ? (
            <View style={styles.errorCard}>
                <Text style={styles.errorText}>{err}</Text>
            </View>
            ) : thisWeekAnnouncements.length === 0 ? (
            <View style={styles.noDataCard}>
                <Text style={styles.noData}>No new announcements</Text>
            </View>
            ) : (
            thisWeekAnnouncements.map((item) => (
                <View style={styles.card} key={item.id}>
                <View style={styles.cardHeader}>
                    <FontAwesome5 name="calendar-day" size={12} color="#64748b" />
                    <Text style={styles.date}>
                    {new Date(item.date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })}
                    </Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.message}</Text>
                </View>
            ))
            )}
            <LinearGradient colors={["transparent", "#f8f8f8"]} style={styles.bottomFade} pointerEvents="none" />
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "95%",
    alignSelf: "center",
    borderRadius: 16,
    backgroundColor: "#fff",
    marginVertical: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  header: {
    backgroundColor: "#9c1006",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  heading: {
    fontWeight: "700",
    fontSize: 16,
    color: "white",
  },
  announcementsContainer: {
    backgroundColor: "#f8f8f8",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 5
  },
  card: {
    backgroundColor: "#f5f5f5ff",
    borderLeftWidth: 4,
    borderLeftColor: "#9c1006",
    borderRadius: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  date: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  title: {
    color: "#101c2e",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  bottomFade: {
    height: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
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
  errorCard: {
    alignItems: "center",
    padding: 10,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
  },
  noDataCard: {
    alignItems: "center",
    padding: 10,
  },
  noData: {
    color: "#64748b",
    fontSize: 14,
  },
})
