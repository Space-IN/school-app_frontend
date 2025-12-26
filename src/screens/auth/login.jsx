import { useState } from "react"
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet,
    Image, ImageBackground,
    ActivityIndicator,
    Keyboard, KeyboardAvoidingView,
    TouchableWithoutFeedback, ScrollView,
    Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "../../context/authContext"
import Toast from "react-native-toast-message"
import Ionicons from '@expo/vector-icons/Ionicons'



export default function LoginScreen() {
    const { login, loading } = useAuth()
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async () => {
        try {
          await login(userId, password)
          Toast.show({
            type: "success",
            text1: "Login Successful."
          })
        } catch(err) {
          Toast.show({
            type: "error",
            text1: "Login Error",
            text2: err.message || "Something went wrong. Try again."
          })
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#ac1d1dff" }}>
          <ImageBackground
              source={require('../../../assets/school.webp')}
              style={styles.background}
              resizeMode="cover"
          >
              <Image
                  source={require('../../../assets/logo.png')}
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
                            <Text style={styles.title}>Login to your portal</Text>
                            <View style={styles.divider} />

                            <TextInput
                                placeholder="User ID"
                                value={userId}
                                onChangeText={setUserId}
                                style={styles.input}
                                autoCapitalize="none"
                            />

                            <TouchableOpacity style={styles.setPassword}>
                              <Text style={styles.setPasswordTextLink}>New User/Forgot Password?</Text>
                            </TouchableOpacity>

                            <View style={styles.passwordContainer}>
                              <TextInput
                                  placeholder="Password"
                                  value={password}
                                  onChangeText={setPassword}
                                  secureTextEntry={!showPassword}
                                  style={styles.input}
                              />

                              <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                              >
                                <Ionicons
                                  name={showPassword ? "eye-sharp" : "eye-off-sharp"}
                                  size={24}
                                  color="black"
                                />
                              </TouchableOpacity>
                            </View>

                            {loading ? (
                                <ActivityIndicator size="large" color="#9c1006ff" style={{ marginTop: 10 }} />
                            ) : (
                                <TouchableOpacity style={[styles.loginButton, { width: '100%', backgroundColor: "#9c1006" } ]} onPress={handleLogin}>
                                  <Text style={styles.loginButtonText}>Login</Text>
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
    backgroundColor: "#F9FAFB"
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
  },
  passwordContainer: {
    width: "100%",
    position: "relative", 
    justifyContent: "center",
    marginTop: 5,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 18,
  },
  setPassword: {
    width: "100%",
    height: "auto",
    marginTop: 5,
  },
  setPasswordTextLink: {
    alignSelf: "flex-end",
    textDecorationLine: "underline",
    color: "#9c1006",
    fontWeight: 800,
  }
})