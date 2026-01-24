import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// --- Cosmic Color Palette ---
const COSMIC_COLORS = {
  deepSpace: ['#0A2540', '#1E3A8A'],
  nebulaPurple: ['#4c1d95', '#6D28D9'], // Updated for contrast
  starlightWhite: '#F8FAFC',
  accentTeal: '#2DD4BF',
  accentPink: '#EC4899',

  // Tile Gradients
  people: ['#1e1b4b', '#4338ca'],   // Deep Indigo
  academics: ['#064e3b', '#10b981'], // Deep Emerald
  analytics: ['#4c1d95', '#8b5cf6'], // Deep Violet
  comm: ['#881337', '#ec4899']       // Deep Rose
};

// --- Reusable Starry Background Effect ---
const StarryBackground = ({ children }) => {
  const stars = Array.from({ length: 20 });

  return (
    <View style={styles.starsContainer}>
      {stars.map((_, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              opacity: Math.random() * 0.7 + 0.3,
            }
          ]}
        />
      ))}
      {children}
    </View>
  );
};

// --- Component: Cosmic Menu Tile ---
const CosmicTile = ({ title, icon, subtitle, gradientColors, onPress, expanded, children, index }) => {
  // Animation Values
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Entrance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: index * 150,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Expansion
  useEffect(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: expanded ? 1 : 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: expanded ? 1 : 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [expanded]);

  const onPressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const maxHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  return (
    <Animated.View style={[
      styles.tileWrapper,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <Animated.View style={[styles.tileContainer, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tileGradient}
          >
            {/* Subtle glow effect */}
            <View style={styles.tileGlow} />

            <View style={styles.tileContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={icon} size={28} color="#fff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.tileTitle}>{title}</Text>
                <Text style={styles.tileSubtitle}>{subtitle}</Text>
              </View>
              <Animated.View style={[styles.arrowContainer, { transform: [{ rotate: rotateInterpolate }] }]}>
                <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.7)" />
              </Animated.View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.dropdownContainer, { maxHeight: maxHeight, opacity: heightAnim }]}>
        <View style={styles.dropdownInner}>
          {children}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// --- Component: Cosmic Sub-Menu Item ---
const CosmicSubItem = ({ label, icon, onPress, color }) => (
  <TouchableOpacity style={styles.subMenuItem} onPress={onPress}>
    <View style={[styles.subIconBox, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.subMenuText}>{label}</Text>
    <Ionicons name="caret-forward-outline" size={14} color="#64748b" />
  </TouchableOpacity>
);

export default function AdminDashboard({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    const loadUserData = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        const parsed = stored ? JSON.parse(stored) : null;
        if (parsed?.role === 'Admin' && parsed?.userId) {
          setUserId(parsed.userId);
        }
      } catch (err) {
        console.error('Error loading userData:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert('Departing so soon?', 'Do you wish to end your session?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const nav = (screen, params) => navigation.navigate(screen, params);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={styles.loadingText}>Loading Mission Control...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={COSMIC_COLORS.deepSpace}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Starry Overlay */}
      <StarryBackground />

      <SafeAreaView style={{ flex: 1 }}>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.missionLabel}>MISSION DASHBOARD</Text>
              <Text style={styles.welcomeText}>
                Welcome back, {userId || 'Commander'}!
              </Text>
              <Text style={styles.missionSubtext}>
                Ready to launch today's mission? 🚀
              </Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={handleLogout}>
              <LinearGradient
                colors={['#6366f1', '#a855f7']}
                style={styles.profileGradient}
              >
                <Ionicons name="person" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Search Bar Simulation */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
            <Text style={styles.searchText}>Search students, events, or warp speed...</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. People & Roles */}
          <CosmicTile
            index={0}
            title="People & Crew"
            subtitle="Manage your Galaxy of Users"
            icon="planet"
            gradientColors={COSMIC_COLORS.people}
            expanded={expandedSection === 'people'}
            onPress={() => toggleSection('people')}
          >
            <CosmicSubItem label="Add New Student" icon="person-add" color="#4338ca" onPress={() => nav('BoardSelectionScreen', { nextScreen: 'AddStudentScreen' })} />
            <CosmicSubItem label="View All Students" icon="list" color="#4338ca" onPress={() => nav('BoardSelectionScreen', { nextScreen: 'AllStudentsScreen' })} />
            <CosmicSubItem label="Add New Faculty" icon="person-add-outline" color="#4338ca" onPress={() => nav('AddFacultyScreen')} />
            <CosmicSubItem label="View Faculty Roster" icon="people-outline" color="#4338ca" onPress={() => nav('AllFacultyScreen')} />
          </CosmicTile>

          {/* 2. Academics */}
          <CosmicTile
            index={1}
            title="Flight Plans"
            subtitle="Subjects, Classes & Timelines"
            icon="school"
            gradientColors={COSMIC_COLORS.academics}
            expanded={expandedSection === 'academics'}
            onPress={() => toggleSection('academics')}
          >
            <CosmicSubItem label="Manage Subjects" icon="book" color="#059669" onPress={() => nav('AddSubjectMasterScreen')} />
            <CosmicSubItem label="Assign Subjects" icon="create" color="#059669" onPress={() => nav('AssignSubjectScreen')} />
            <CosmicSubItem label="Schedule Timeline" icon="calendar" color="#059669" onPress={() => nav('ClassScheduleScreen')} />
            <CosmicSubItem label="View Timetable" icon="eye" color="#059669" onPress={() => nav('ClassScheduleViewScreen')} />
          </CosmicTile>

          {/* 3. Analytics */}
          <CosmicTile
            index={2}
            title="Mission Stats"
            subtitle="Performance & Reports"
            icon="pie-chart"
            gradientColors={COSMIC_COLORS.analytics}
            expanded={expandedSection === 'analytics'}
            onPress={() => toggleSection('analytics')}
          >
            <CosmicSubItem label="Faculty Performance" icon="trending-up" color="#7c3aed" onPress={() => nav('FacultyPerformance')} />
            <CosmicSubItem label="Attendance Heatmap" icon="stats-chart" color="#7c3aed" onPress={() => nav('AdminAttendanceScreen')} />
          </CosmicTile>

          {/* 4. Communication */}
          <CosmicTile
            index={3}
            title="Comms Relay"
            subtitle="Broadcasts, Notices & Events"
            icon="radio"
            gradientColors={COSMIC_COLORS.comm}
            expanded={expandedSection === 'comm'}
            onPress={() => toggleSection('comm')}
          >
            <CosmicSubItem label="Schedule Event" icon="calendar-outline" color="#db2777" onPress={() => nav('AddEventScreen')} />
            <CosmicSubItem label="Transmit Notice" icon="mic-outline" color="#db2777" onPress={() => nav('AddNoticeScreen')} />
            <CosmicSubItem label="Manage Posters" icon="images-outline" color="#db2777" onPress={() => nav('AdminPosterManager')} />
          </CosmicTile>

          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Renaming the tile for consistency in the JSX above
const MenuCard = CosmicTile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540', // Fallback color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    color: '#cbd5e1',
    marginTop: 10,
    fontSize: 16,
    letterSpacing: 1,
  },

  /* Stars Background */
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 50,
  },

  /* Header */
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  missionLabel: {
    color: '#2DD4BF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  missionSubtext: {
    fontSize: 14,
    color: 'rgba(248, 250, 252, 0.7)',
    marginTop: 4,
  },
  profileBtn: {
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },

  /* Search Bar */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchText: {
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 10,
    fontSize: 14,
  },

  /* Scroll Content */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 1,
  },

  /* Tile Styles */
  tileWrapper: {
    marginBottom: 16,
    borderRadius: 24,
    // Neumorphic shadow simulation for deep space
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  tileContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tileGradient: {
    padding: 20,
    position: 'relative',
  },
  tileGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textContainer: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tileSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  arrowContainer: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
  },

  /* Dropdown Styles */
  dropdownContainer: {
    backgroundColor: '#0f172a', // Darker background for contrast
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginTop: -20, // Overlap slightly to look connected
    paddingTop: 20,
    zIndex: -1,
  },
  dropdownInner: {
    padding: 16,
    paddingTop: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#1e293b', // Dark Slate for cards
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  subIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  subMenuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0', // Light text
  },
});
