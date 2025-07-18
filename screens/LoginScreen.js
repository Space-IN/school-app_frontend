import React, { useState } from 'react';
 
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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
      const response = await axios.post('http://10.221.34.145:5000/api/auth/login', {
        userId: normalizedId,
        password,
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
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
          });
          break;

        case 'Faculty':
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'FacultyTabs',
                params: {
                  userId: user.userId,
                  name: user.name,
                  grades: user.grades || [],
                  section: user.section,
                  assignedSubjects: user.assignedSubjects || [],
                },
              },
            ],
          });
          break;

        case 'Student':
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'StudentParentTabs',
                params: {
                  userId: user.userId,
                  studentName: user.studentName,
                  className: user.className,
                  section: user.section,
                },
              },
            ],
          });
          break;

        case 'Parent':
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'StudentParentTabs',
                params: {
                  userId: user.userId,
                  studentName: user.student?.name,
                  className: user.student?.className,
                  section: user.student?.section,
                },
              },
            ],
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

      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
       style={{ flex: 1 }}>

      <View style={styles.overlay}>
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
          <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 10 }} />
        ) : (
          <Button title="Login" onPress={loginUser} />
        )}
      </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: { width: 100, height: 100, marginBottom: 20 },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
});
