import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useRoute, useNavigation } from "@react-navigation/native"
import Toast from "react-native-toast-message"
import { api } from "../../api/api"



export default function optScreen() {
    const route = useRoute()
    const navigation = useNavigation()
    const { userId } = route.params
    const [maskedPhone, setMaskedPhone] = useState()
    const [loading, setLoading] = useState(false)

    const getPhone = async () => {
        try {
            setLoading(true)
            const res = await api.post("/auth/masked-phone", { userId })
            setMaskedPhone(res.data.maskedPhone)
        } catch(err) {
            Toast.show({
                type: "error",
                text: "Failed to fetch phone number. Please try again later.",
                text2: err.response?.data?.error
            })
        } finally {
            setLoading(false)
        }
    }

    const sendOtp = async () => {
        try {
            setLoading(true)
            const res = await api.post("/auth/send-otp", { userId })
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
        }
    }

    return (
        <View style={styles.container}>
            {maskedPhone && (
                <Text style={styles.infoText}>
                    An OTP will be sent to the phone number {maskedPhone}
                </Text>
            )}

            <TouchableOpacity
                style={style.optButton}
                onPress={sendOtp}
                disabled={loading}
            >
                <Text style={styles.otpButtonText}>
                    {loading ? "Sending..." : "Send OTP"}
                </Text>
            </TouchableOpacity>
        </View>
    )
}