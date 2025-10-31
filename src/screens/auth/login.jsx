import { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet,
    Image, ImageBackground,
    ActivityIndicator,
    Keyboard, KeyboardAvoidingView,
    TouchableWithoutFeedback, ScrollView,
    Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/authContext";
import Toast from "react-native-toast-message";


export default function LoginScreen() {
    const { login, loading } = useAuth()
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async () => {
        try {
          await login(userId, password)
        } catch(err) {
          Toast.show({ type: "error", text1: err })
        }
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground
                source={require('../../assets/school.webp')}
                style={styles.background}
                resizeMode="cover"
            >
                <Image
                    source={require('../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView
                            contentContainerStyle={styles.scrollContainer}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.loginBox}>
                                <Text style={styles.title}>Login with your User ID</Text>
                                <View style={styles.divider} />

                                <TextInput
                                    placeholder="User ID"
                                    value={userId}
                                    onChangeText={setUserId}
                                    style={styles.input}
                                    autoCapitalize="none"
                                />
                                <TextInput
                                    placeholder="Password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    style={styles.input}
                                />

                                {loading ? (
                                    <ActivityIndicator size="large" color="#9c1006ff" style={{ marginTop: 10 }} />
                                ) : (
                                    <TouchableOpacity style={{ width: '100%' }} onPress={handleLogin}>
                                        <LinearGradient
                                            colors={['#9c1006', '#b71c1c']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={styles.loginButton}
                                        >
                                            <Text style={styles.loginButtonText}>Login</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </ImageBackground>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 25,
  },
  loginBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 15,
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 30
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 21,
    textAlign: 'center',
    fontWeight: "900",
    color: '#9c1006',
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  logo: {
    position: 'relative',
    width: '50%',
    marginLeft: '25%',
    marginTop: '10%'
  },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: "#3b3939ff",
    width: "100%",
    marginTop: 8,
    marginBottom: 35,
  }
});