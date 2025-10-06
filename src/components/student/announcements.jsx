import { FlatList, StyleSheet, Text, View, Dimensions } from "react-native"
import Foundation from '@expo/vector-icons/Foundation'

const announcements = [
  { id: "1", title: "Exam Schedule Released", description: "on the date 13-02-2025 the exam will be held" },
  { id: "2", title: "Sports Day Next Week", description: "as mentioned before, sports meeting will be conducted" },
  { id: "3", title: "Holiday on Monday", description: "on account of gandhi jayanthi, schools will be closed" },
  { id: "4", title: "Library Timings Updated", description: "new library timings for class 6" },
  { id: "5", title: "Parent-Teacher Meeting", description: "parent teacher meeting to be held on december 5th" },
  { id: "5", title: "Parent-Teacher Meeting", description: "parent teacher meeting to be held on december 5th" },
]


export default function StudentAnnoucements() {
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    )
    
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Foundation name="megaphone" size={24} color="white" />
                <Text style={styles.heading}>Announcements</Text>
            </View>

            <View style={styles.announcementsContainer}>
                {announcements.length === 0 ? (
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
    },
    heading: {
        fontWeight: "700",
        marginLeft: 13,
        fontSize: 18,
        color: "white"
    },
    announcementsContainer: {
        // padding: 5,
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
        padding: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
    },
    title: {
        color: "white",
        fontSize: 15,
        fontWeight: "500"
    },
    description: {
        color: "#DCDCDC",
        fontSize: 12
    }
})