import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import BASE_URL from "../config/baseURL";

export default function LoginScreen({ route, navigation }) {
  const { role } = route.params;
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (!userId || !password) {
      Alert.alert('Error', 'Please enter both User ID and Password');
      return;
    }

    const normalizedId = userId.trim().toLowerCase();
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        userId: normalizedId,
        password,
        role,
      });

      const user = response.data;
      console.log('✅ Logged in user data:', user);

      if (!user.role) {
        Alert.alert('Login Failed', 'User role not received from server');
        return;
      }

      // ✅ Save relevant data to AsyncStorage
      if (user.role === 'Faculty') {
        await AsyncStorage.setItem(
          'userData',
          JSON.stringify({
            role: user.role,
            userId: user.userId,
            name: user.name,
            grades: user.grades || [],
            section: user.section,
            assignedSubjects: user.assignedSubjects || [],
          })
        );
      } else {
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      }

      // ✅ Navigate based on role
      switch (user.role) {
        case 'Admin':
          navigation.reset({ index: 0, routes: [{ name: 'AdminDashboard' }] });
          break;
        case 'Faculty':
          navigation.reset({
            index: 0,
            routes: [{
              name: 'FacultyTabs',
              params: {
                userId: user.userId,
                name: user.name,
                grades: user.grades || [],
                section: user.section,
                assignedSubjects: user.assignedSubjects || [],
              },
            }],
          });
          break;
        case 'Student':
          navigation.reset({
            index: 0,
            routes: [{
              name: 'StudentParentTabs',
              params: {
                userId: user.userId,
                studentName: user.studentName,
                className: user.className,
                section: user.section,
              },
            }],
          });
          break;
        case 'Parent':
          navigation.reset({
            index: 0,
            routes: [{
              name: 'StudentParentTabs',
              params: {
                userId: user.userId,
                studentName: user.student?.name,
                className: user.student?.className,
                section: user.student?.section,
              },
            }],
          });
          break;
        default:
          Alert.alert('Login Failed', 'Unknown user role.');
          break;
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      Alert.alert('Login Failed', err.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'Admin':
        return require('../assets/admin.png');
      case 'Faculty':
        return require('../assets/classroom.png');
      case 'Student/Parent':
        return require('../assets/family.png');
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('../assets/schoolbackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      {/* ✅ Top-right logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.topRightLogo}
        resizeMode="contain"
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.loginBox}>
              <Image source={getRoleIcon()} style={styles.icon} resizeMode="contain" />
              <Text style={styles.title}>Login as {role}</Text>

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
                <ActivityIndicator size="large" color="#9c1006" style={{ marginTop: 10 }} />
              ) : (
                <TouchableOpacity onPress={loginUser} style={{ width: '100%' }}>
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
  );
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
    padding: 24,
  },
  loginBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
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
  topRightLogo: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 70,
    height: 50,
  },
  loginButton: {
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
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
    fontWeight: '700',
  },
});
