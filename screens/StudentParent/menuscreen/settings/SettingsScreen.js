// screens/StudentParent/menuscreen/SettingsScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const navigation = useNavigation();

  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('userData');
            navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const settingsOptions = [
    {
      title: 'Fees Section',
      icon: 'card-outline',
      screen: 'FeesScreen',
    },
    {
      title: 'Change Password',
      icon: 'key-outline',
      screen: 'ChangePasswordScreen',
    },
    {
      title: 'Privacy Policy',
      icon: 'lock-closed-outline',
      screen: 'PrivacyPolicyScreen',
    },
    {
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      screen: 'TermsScreen',
    },
    {
      title: 'About Us',
      icon: 'information-circle-outline',
      screen: 'AboutScreen',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {settingsOptions.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.option}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Ionicons name={item.icon} size={24} color="#4B5563" />
          <Text style={styles.optionText}>{item.title}</Text>
        </TouchableOpacity>
      ))}

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#F3F4F6',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 30,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  optionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#374151',
  },
  logoutContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
  },
});
