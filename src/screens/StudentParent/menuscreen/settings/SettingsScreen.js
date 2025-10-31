import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const SettingsItem = ({ icon, title, screen, isLogout = false }) => {
  const navigation = useNavigation();
  const animatedValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const confirmLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
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

  const onPress = isLogout ? confirmLogout : () => navigation.navigate(screen);

  return (
    <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.itemContainer, isLogout && styles.logoutButton]}
      >
        <Ionicons name={icon} size={24} color={isLogout ? '#fff' : '#1e3a8a'} />
        <Text style={[styles.itemText, isLogout && styles.logoutText]}>{title}</Text>
        {!isLogout && <Ionicons name="chevron-forward-outline" size={22} color="#9ca3af" />}
      </Pressable>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const accountItems = [
    { title: 'Change Password', icon: 'key-outline', screen: 'changePasswordScreen' },
  ];

  const moreItems = [
    { title: 'Privacy Policy', icon: 'lock-closed-outline', screen: 'privacyPolicyScreen' },
    { title: 'Terms & Conditions', icon: 'document-text-outline', screen: 'termsScreen' },
    { title: 'About Us', icon: 'information-circle-outline', screen: 'aboutScreen' },
  ];

  return (
    <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Settings</Text>
          <Text style={styles.subHeaderText}>Manage your account and app settings</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          {accountItems.map((item, index) => <SettingsItem key={index} {...item} />)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>More</Text>
          {moreItems.map((item, index) => <SettingsItem key={index} {...item} />)}
        </View>

        <View style={{ marginTop: 20 }}>
          <SettingsItem icon="log-out-outline" title="Logout" isLogout={true} />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});