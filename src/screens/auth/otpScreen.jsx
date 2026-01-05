import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from "react-native"
import Toast from "react-native-toast-message"
import { sendOtp } from "../../controllers/authController"
import { SafeAreaView } from "react-native-safe-area-context"



export default function OptScreen({ route, navigation }) {
    const { maskedPhone, userId } = route.params
    const [loading, setLoading] = useState(false)

    const sendOtpToUser = async () => {
        setLoading(true)
        try {
            await sendOtp(userId)
            Toast.show({
                type: "success",
                text1: "OTP sent to your phone number",
            })
        } catch(err) {
            Toast.show({
                type: "error",
                text1: "Failed to send OTP",
                text2: err.response?.data?.error || "Please try again later."
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ac1d1dff", }}>
            <ImageBackground
                source={require('../../../assets/school.webp')}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Set New Password</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.otpContainer}>
                        {maskedPhone && (
                            <Text style={styles.infoText}>
                                An OTP will be sent to the phone number {maskedPhone}
                            </Text>
                        )}

                        <TouchableOpacity
                            style={[styles.optButton, loading && { opacity: 0.5, },]}
                            onPress={sendOtpToUser}
                            disabled={loading}
                        >
                            <Text style={styles.otpButtonText}>
                                {loading ? "Sending..." : "Send OTP"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ImageBackground>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: "#F9FAFB",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "90%",
        height: "fit-content",
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
    },
    otpContainer: {
        padding: 20,
        gap: 20,
    },
    titleContainer: {
        padding: 10
    },
    title: {
        fontSize: 21,
        textAlign: 'center',
        fontWeight: "900",
        color: '#9c1006',
    },
    divider: {
        height: 1,
        backgroundColor: "#3b3939ff",
        width: "100%",
        marginBottom: 20,
    },
    infoText: {
        fontSize: 20,
        fontWeight: 900,
        color: "#2c2b2bff",
        alignSelf: "center",
        textAlign: "center",
    },
    optButton: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#9c1006',
        width: "30%",
        alignSelf: "center"
    },
    otpButtonText: {
        fontWeight: 900,
        fontSize: 15,
        color: "white",
        alignSelf: "center"
    },
})