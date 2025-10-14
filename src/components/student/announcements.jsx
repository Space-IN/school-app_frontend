import { FlatList, StyleSheet, Text, View, Dimensions } from "react-native"
import Foundation from '@expo/vector-icons/Foundation'
import { useEffect, useState } from "react"
import { fetchAnnouncements } from "../../controllers/studentDataController"
import { ActivityIndicator } from "react-native"


export default function StudentAnnouncements() {
    const [announcements, setAnnouncements] = useState([])
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState(null)

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.date}>
                {new Date(item.date).toLocaleString("en-IN", {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })}
            </Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.message}</Text>
        </View>
    )


    useEffect(() => {
        const loadAnnouncements = async () => {
            setLoading(true)
            try {
                const response = await fetchAnnouncements()
                if(response) setAnnouncements(response)
            } catch(err) {
                setErr(err.message || "an error occured while fetching announcements.")
            } finally {
                setLoading(false)
            }
        }
        loadAnnouncements()
    }, [])
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Foundation name="megaphone" size={24} color="white" />
                <Text style={styles.heading}>Announcements</Text>
            </View>

            <View style={styles.announcementsContainer}>
                {loading ? (
                    <View style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 10 }}>
                        <ActivityIndicator size="small" color="#9c1006ff" />
                        <Text style={styles.loadingText}>Loading announcements...</Text>
                    </View>
                ) : err ? (
                    <View style={styles.card}>
                        <Text style={styles.noData}>{err}</Text>
                    </View>
                ) : announcements.length === 0 ? (
                    <View style={styles.card}>
                        <Text style={styles.noData}>No new announcements</Text>
                    </View>
                ) : (
                    <FlatList
                        data={announcements}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
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
        width: "95%",
        alignSelf: "center",
        backgroundColor: "#475569",
        overflow: "hidden"
    },
    header: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        height: 50,
        backgroundColor: "#2a3546ff",
        padding: 10,
        paddingLeft: 20,
        gap: 10,
    },
    heading: {
        fontWeight: "700",
        fontSize: 18,
        color: "white"
    },
    announcementsContainer: {
    },
    noData: {
        fontSize: 14,
        color: "#DCDCDC",
        paddingVertical: 8,
        alignSelf: "center"
    },
    list: {
        maxHeight: Dimensions.get("window").height * 0.35,
        width: "100%",
    },
    card: {
        width: "100%",
        padding: 11,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
    },
    title: {
        color: "white",
        fontSize: 18,
        fontWeight: "500",
        marginTop: 10
    },
    description: {
        color: "#DCDCDC",
        fontSize: 14
    },
    loadingText: {
        color: "#a9b6c9ff",
        fontSize: 14,
        marginTop: 8,
    },
    date: {
        color: "white",
        fontSize: 12,
        fontWeight: "500"        
    }
})