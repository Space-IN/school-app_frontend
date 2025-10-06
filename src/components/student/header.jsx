import { View, Image, TouchableOpacity, StyleSheet } from "react-native"
import Ionicons from '@expo/vector-icons/Ionicons'



export default function StudentHeader({ navigation, route, options, back }) {

    return (
        <View style={styles.container}>
            {back ? (
                <TouchableOpacity onPress={navigation.goback}>
                    <Ionicons name="caret-back-outline" size={24} color="black" />
                </TouchableOpacity>
            ) : (
                <Image
                    source={require("../../assets/logo.png")}
                    style={styles.logo}
                />
            )}

            <TouchableOpacity onPress={() => alert("right icon clicked!")}>
                <Ionicons name="calendar" size={20} color="white" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 80,
        paddingTop: "6%",
        paddingHorizontal: "5%",
        backgroundColor: "#c01e12ff",
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
    },
    logo: {
        width: 130,
        height: 130,
        resizeMode: "contain",
    }
})