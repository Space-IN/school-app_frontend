import { useRef } from "react"
import { View, StyleSheet, Text, FlatList, TouchableOpacity, } from "react-native"
import { Ionicons, MaterialIcons } from "@expo/vector-icons"



export default function SettingsScreen({ navigation, route }) {
    const { studentData } = route.params
    const flatListRef = useRef(null)

    const accountSettingsItems = [
        {
            title: 'CHANGE PASSWORD',
            screen: 'otp',
            icon: 'password',
            data: {
                phone: studentData?.fatherContact,
                userId: studentData?.userId,
                uiFlow: 'settings',
            },
        },
    ]

    
    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>SETTINGS</Text>
                <Text style={styles.headerSubtitle}>Customize your Experience.</Text>
            </View>

            <View style={styles.optionContainer}>
                <View style={styles.settingsHeaderContainer}>
                    <Text style={styles.settingsHeaderTitle}>ACCOUNT SETTINGS</Text>
                    <Text style={styles.settingsHeaderSubtitle}>Manage profile, password, and security.</Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={accountSettingsItems}
                    keyExtractor={(item) => item.title}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.item}
                            onPress={() =>
                                navigation.navigate(item.screen, item.data)
                            }
                        >
                            <View style={styles.content}>
                                <MaterialIcons name={item.icon} size={20} color="black" />
                                <Text style={styles.itemText}>{item.title}</Text>
                            </View>
                            <Ionicons name="caret-forward" size={20} color="black" />
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: 10,
    },
    headerContainer: {
        width: "100%",
        height: "20%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 27,
        fontWeight: "900",
    },
    headerSubtitle: {
        fontSize: 15,
        fontWeight: "500"
    },
    optionContainer: {
        display: "flex",
        alignSelf: "center",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
        width: "95%",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        gap: 6,
    },
    settingsHeaderContainer: {
        width: "90%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        marginLeft: 10
    },
    settingsHeaderTitle: {
        fontSize: 18,
        fontWeight: "900",
    },
    settingsHeaderSubtitle: {
        fontSize: 12,
        fontWeight: "500"
    },
    list: {
        padding: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F0F4F7',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    itemText: {
        fontSize: 12,
        fontWeight: '700',
        color: 'black',
        flex: 1,
        textAlign: 'left',
        marginLeft: 10
    },
})