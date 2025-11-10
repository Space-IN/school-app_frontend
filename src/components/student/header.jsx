import { useEffect, useState } from "react"
import { View, Image, TouchableOpacity, StyleSheet, Modal, Text } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons'
import { Calendar, CalendarList, Agenda } from "react-native-calendars"



const CalendarModal = ({ visible, onClose }) => {

    // useEffect(() => {
    //     const fetchHolidays = async () => {
    //         try {
    //             const response = await fetch("https://date.nager.at/api/v3/PublicHolidays/2025/IN")
    //             const data = await response.json()
    //             console.log("data from nager.date: ", data)

    //             const holidayMap = {}
    //             data.forEach((holiday) => {
    //                 holidayMap[holiday.date] = {
    //                     name: holiday.localName,
    //                     type: "holiday",
    //                 }
    //             })
    //             setHolidays(holidayMap)
    //         } catch(err) {
    //             console.error("error fetching holidays: ", err)
    //         }
    //     }
    //     fetchHolidays()
    // }, [])

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Calendar
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#9c1006',
                            selectedDayBackgroundColor: '#9c1006',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#9c1006',
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            arrowColor: '#9c1006',
                            monthTextColor: '#000',
                            textDayFontFamily: 'System',
                            textMonthFontWeight: 'bold',
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 13,
                            textDayFontSize: 15,
                            textDayFontWeight: "800",
                            arrowStyle: { padding: 15 },
                            textMonthFontSize: 20,
                        }}
                        style={{
                            borderRadius: 12,
                            elevation: 3,
                            shadowColor: "#000",
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        }}
                    />

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.9}>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}


export default function StudentHeader({ navigation, back }) {
    const [modalVisible, setModalVisible] = useState(false)

    return (
        <View style={styles.container}>
            <View style={styles.elementContainer}>
                {back ? (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="caret-back-outline" size={24} color="white" />
                    </TouchableOpacity>
                ) : (
                    <Image
                        source={require("../../../assets/logo.png")}
                        style={styles.logo}
                    />
                )}

                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="calendar" size={20} color="white" />
                </TouchableOpacity>

                <CalendarModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 90,
        paddingTop: "6%",
        paddingHorizontal: "5%",
        backgroundColor: "#ac1d1dff",
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
    },
    elementContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        marginTop: 10,

    },
    logo: {
        width: 130,
        height: 130,
        resizeMode: "contain",
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.42)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "#e7e1e1ff",
        borderRadius: 12,
        padding: 15,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    closeBtn: {
        backgroundColor: "#eb1313e0",
        padding: 10,
        borderRadius: 8,
        marginTop: 20,
        alignItems: "center",
    },
    eventInfo: {
        marginTop: 15,
        padding: 10,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    eventText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
})