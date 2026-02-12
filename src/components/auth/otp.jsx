import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, TextInput, ActivityIndicator } from "react-native"
import { sendOtp, verifyOtp } from "../../controllers/authController"




export default function OtpTab({ phoneNumber, userId, navigation, uiFlow }) {
    const [otpState, setOtpState] = useState("idle")
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [timer, setTimer] = useState(30)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const inputRefs = useRef([])

    const handleOtpChange = (val, idx) => {
        if(!/^\d?$/.test(val)) return

        const updated = [...otp]
        updated[idx] = val
        setOtp(updated)
        setError("")

        if(val && idx<5) inputRefs.current[idx+1]?.focus()
        
        if(updated.every(d => d!=="")) {
            Keyboard.dismiss()
            verifyEnteredOtp(updated.join(""))
        }
    }

    const handleSendOtp = async () => {
        setLoading(true)
        setError("")
        try {
            await sendOtp(userId)

            setOtpState("sent")
            setOtp(["", "", "", "", "", ""])
            setTimer(30)

            setTimeout(() => { inputRefs.current[0]?.focus() }, 300)
        } catch(err) {
            setError(err.response?.data?.error || "Failed to send OTP. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const verifyEnteredOtp = async (code) => {
        setOtpState("verifying")

        try {
            const res = await verifyOtp(userId, code)
            navigation.replace("setPassword", { resetToken: res.resetToken, uiFlow: uiFlow, })
        } catch(err) {
            setError(err.response?.data?.error || "Invalid OTP. Please try again.")
            setOtp(["", "", "", "", "", ""])
            setOtpState("sent")

            setTimeout(() => { inputRefs.current[0]?.focus() }, 300)
        }
    }


    useEffect(() => {
        if(otpState!=="sent" || timer===0) return
        const interval = setInterval(() => {
            setTimer(t => t-1)
        }, 1000)
        return () => clearInterval(interval)
    }, [otpState, timer])

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Verify OTP</Text>
            </View>
            <View style={styles.divider} />

            {otpState==="idle" && (
                <View style={styles.otpContainer}>
                    {phoneNumber && (
                        <Text style={styles.infoText}>
                            An OTP will be sent to the phone number {phoneNumber}
                        </Text>
                    )}

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.otpButton, loading && { opacity: 0.5, },]}
                        onPress={handleSendOtp}
                        disabled={loading}
                    >
                        <Text style={styles.otpButtonText}>
                            {loading ? "Sending..." : "Send OTP"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {otpState === "sent" && (
                <View style={styles.otpContainer}>
                    <Text style={styles.infoText}>
                        An OTP has been sent to {phoneNumber}
                    </Text>

                    <View style={styles.otpRow}>
                        {otp.map((digit, i) => (
                            <TextInput
                                key={i}
                                ref={(el) => (inputRefs.current[i] = el)}
                                value={digit}
                                keyboardType="number-pad"
                                maxLength={1}
                                style={styles.otpBox}
                                onChangeText={(val) => handleOtpChange(val, i)}
                            />
                        ))}
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        disabled={timer > 0}
                        onPress={handleSendOtp}
                        style={styles.resendButton}
                    >
                        <Text style={styles.resendText}>
                            {timer>0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {otpState === "verifying" && (
                <ActivityIndicator size="large" color="#9c1006" style={{ margin: 20 }} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "90%",
        height: "fit-content",
        backgroundColor: 'rgba(226, 226, 226, 0.85)',
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
    otpButton: {
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
    error: {
        color: "#d32f2f",
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
    },
    otpRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 15,
    },
    resendText: {
        color: "white",
        fontWeight: "900",
    },
    otpBox: {
        width: 45,
        height: 55,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        textAlign: "center",
        fontSize: 22,
        fontWeight: "900",
    },
    resendButton: {
        alignSelf: "center",
        backgroundColor: "#9c1006",
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
})