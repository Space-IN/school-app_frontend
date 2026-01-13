import { useState, } from "react"
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ActivityIndicator, } from "react-native"
import Toast from "react-native-toast-message"
import { Ionicons } from "@expo/vector-icons"
import { resetPassword } from "../../controllers/authController"
import { useAuth } from "../../context/authContext"



export default function SetPasswordContainer({ navigation, resetToken, uiFlow }) {
    const { logout } = useAuth()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    let passwordsMatch = (password && confirmPassword) ? password===confirmPassword : false
    let isStrong = password.length>=8
    let canSubmit = passwordsMatch && isStrong && !loading

    const handleSubmit = async () => {
        if(!canSubmit) return

        setLoading(true)
        setError("")
        try {
            await resetPassword(password, resetToken)
            Toast.show({
                type: "success",
                text1: "Password updated successfully.",
                text2: "Login to your account with your new password.",
            })
            if(uiFlow==="auth") {
                navigation.replace("login")
            } else {
                logout()
            }
        } catch(err) {
            setError(err.response?.data?.error || "Failed to set password. Please try again.")
        } finally {
            setLoading(false)
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Set New Password</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="New Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={(t) => {
                            setPassword(t)
                            setError("")
                        }}
                        style={styles.input}
                    />
                    <TouchableOpacity style={styles.eye} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} />
                    </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                    <TextInput
                        placeholder="Confirm Password"
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={(t) => {
                            setConfirmPassword(t)
                            setError("")
                        }}
                        style={styles.input}
                    />
                </View>
            </View>

            <View style={styles.ruleContainer}>
                <Text style={[styles.rule, isStrong ? styles.ruleOk : styles.ruleBad,]}>
                    • Minimum 8 characters
                </Text>
                <Text style={[styles.rule, passwordsMatch ? styles.ruleOk : styles.ruleBad,]}>
                    • Passwords must match
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                {error ? <Text style={styles.error}>{error}</Text> : null}

                <TouchableOpacity
                    style={[styles.button, (!canSubmit || loading) && styles.disabled, ]}
                    onPress={handleSubmit}
                    disabled={!canSubmit || loading}
                >
                    {loading ? (
                        <ActivityIndicator size="large" color="#9c1006" />
                    ) : (
                        <Text style={styles.buttonText}>Set Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "90%",
        height: "fit-content",
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 20,
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
    error: {
        color: "#d32f2f",
        fontWeight: "700",
        marginBottom: 10,
        textAlign: "center",
    },
    inputContainer: {
        width: "100%",
        paddingHorizontal: 10,
    },
    inputWrapper: {
        position: "relative",
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    eye: {
        position: "absolute",
        right: 12,
        top: 16,
    },
    ruleContainer: {
        width: "100%",
        paddingHorizontal: 30,
        marginBottom: 5,
    },
    rule: {
        fontSize: 14,
        marginBottom: 4,
    },
    ruleOk: {
        color: "green",
        fontWeight: "900",
    },
    ruleBad: {
        color: "#d32f2f",
        fontWeight: "900",
    },
    error: {
        color: "#d32f2f",
        fontWeight: "900",
        marginVertical: 10,
        textAlign: "center",
    },
    buttonContainer: {
        padding: 10,
    },
    button: {
        backgroundColor: "#9c1006",
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },
    disabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },
})