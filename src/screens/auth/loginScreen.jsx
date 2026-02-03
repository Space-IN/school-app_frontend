import { useState, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet,
    Image, ImageBackground,
    ActivityIndicator,
    Keyboard, KeyboardAvoidingView,
    TouchableWithoutFeedback, ScrollView,
    Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '../../context/authContext'
import { getMaskedPhone } from '../../controllers/authController'



export default function LoginScreen() {
  const navigation = useNavigation()
  const { login, loading } = useAuth()
  const userIdRef = useRef(null)
  const [userId, setUserId] = useState('')
  const [userIdError, setUserIdError] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [maskedPhoneLoading, setMaskedPhoneLoading] = useState(false)

  const handleLogin = async () => {
    let hasError = false
    if(!userId.trim()) {
      setUserIdError(true)
      userIdRef.current?.focus()
      hasError = true
    }
    if(!password.trim()) {
      setPasswordError(true)
      hasError = true
    }

    if(hasError) {
      return
    } else {
      try {
        await login(userId, password)
        Toast.show({
          type: "success",
          text1: "Login Successful."
        })
      } catch(err) {
        const status = err.response?.status
        const serverError = err.response?.data?.error_description

        let message = "Something went wrong. Try again."
        if(status===401) {
          message = "Invalid User ID or Password."
        }

        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: message,
        })
      }
    }
  }

  const getUserMaskedPhone = async () => {
    if(!userId.trim()) {
      setUserIdError(true)
      userIdRef.current?.focus()
      return
    }

    setMaskedPhoneLoading(true)
    try {
      const maskedPhone = await getMaskedPhone(userId)
      if(maskedPhone)
        navigation.navigate('otp', { phone: maskedPhone.data, userId, uiFlow: "auth", })
    } catch(err) {
      const status = err.response?.status
      const serverMessage = err.response?.data?.error || err.response?.data?.message
      if(status===404) {
        Toast.show({
          type: "error",
          text1: "Invalid User ID. Please enter a valid User ID.",
          text2: serverMessage
        })
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to fetch phone number. Please try again later.",
          text2: serverMessage
        })        
      }
    } finally {
      setMaskedPhoneLoading(false)
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
                <Text style={styles.title}>Login to your Portal</Text>
                <View style={styles.divider} />

                <View style={styles.fieldContainer}>
                  <View style={styles.userIdContainer}>
                    <TextInput
                      ref={userIdRef}
                      placeholder="User ID"
                      value={userId}
                      onChangeText={(text) => {
                        setUserId(text)
                        if(userIdError) setUserIdError(false)
                      }}
                      style={[
                        styles.input,
                        userIdError && {
                          borderColor: '#d32f2f', borderWidth: 2,
                        },
                      ]}
                      autoCapitalize="none"
                    />
                    {userIdError && (
                      <Text style={styles.userIdErrorText}>User ID is required.</Text>
                    )}
                  </View>

                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Password"
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text)
                        if(passwordError) setPasswordError(false)
                      }}
                      secureTextEntry={!showPassword}
                      style={[
                        styles.input,
                        passwordError && {
                          borderColor: '#d32f2f', borderWidth: 2,
                        }
                      ]}
                    />
                    {passwordError && (
                      <Text style={styles.userIdErrorText}>Password is required.</Text>
                    )}

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
                </View>

                <TouchableOpacity style={styles.setPassword} onPress={getUserMaskedPhone} disabled={maskedPhoneLoading}>
                  {maskedPhoneLoading ? (
                    <Text style={styles.disabledSetPasswordTextLink}>Verifying User...</Text>
                  ) : (
                    <Text style={styles.setPasswordTextLink}>New User/Forgot Password?</Text>
                  )}
                </TouchableOpacity>

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
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 18,
  },
  setPassword: {
    width: "100%",
    height: "auto",
    marginTop: 30,
  },
  setPasswordTextLink: {
    fontSize: 16,
    alignSelf: "center",
    textDecorationLine: "underline",
    color: "#9c1006",
    fontWeight: 800,
  },
  disabledSetPasswordTextLink: {
    alignSelf: "center",
    fontWeight: 800,
    color: "#736F73"
  },
  userIdContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    marginBottom: 15
  },
  userIdErrorText: {
    alignSelf: "flex-end",
    color: '#d32f2f',
    fontSize: 13,
    fontWeight: 700
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 10,
  }
})