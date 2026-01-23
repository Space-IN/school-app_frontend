import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
    Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// --- Corporate Brand Palette ---
const PRO_COLORS = {
    background: '#F1F5F9', // Slate-100
    textPrimary: '#0F172A', // Slate-900
    textSecondary: '#64748B', // Slate-500
    cardBg: '#FFFFFF',

    // Strict Brand Gradients (Alternating Theme)
    corporateBlue: ['#1e3a8a', '#3b82f6'], // Navy to Blue-500
    corporateTeal: ['#0f766e', '#14b8a6'], // Deep Teal to Teal-500

    // Accents for Sub-menus
    iconBlue: '#1e3a8a',
    iconTeal: '#0f766e',
};

// --- Component: Professional Menu Tile ---
const MenuTile = ({ title, icon, gradientColors, onPress, expanded, children, index }) => {
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
                delay: index * 60,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                delay: index * 60,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Expansion
    useEffect(() => {
        Animated.parallel([
            Animated.timing(heightAnim, {
                toValue: expanded ? 1 : 0,
                duration: 350,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
            }),
            Animated.timing(rotateAnim, {
                toValue: expanded ? 1 : 0,
                duration: 350,
                useNativeDriver: true,
            }),
        ]).start();
    }, [expanded]);

    const onPressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
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
        outputRange: [0, 600],
    });

    return (
        <Animated.View style={[
            styles.tileWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
            <TouchableOpacity
                activeOpacity={0.9} // More tactile feedback
                onPress={onPress}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
            >
                <Animated.View style={[styles.tileContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }} // Diagonal gradient for premium look
                        style={styles.tileGradient}
                    >
                        {/* Subtle Glass-like Overlay for Texture */}
                        <View style={styles.glassOverlay} />

                        <View style={styles.tileContent}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={icon} size={26} color="#fff" />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.tileTitle}>{title}</Text>
                            </View>
                            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                                <Ionicons name={expanded ? "remove-outline" : "add-outline"} size={22} color="rgba(255,255,255,0.9)" />
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

// --- Component: Sub-Menu Item ---
const SubMenuItem = ({ label, icon, onPress, color }) => (
    <TouchableOpacity style={styles.subMenuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.subIconBox, { backgroundColor: `${color}10` }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.subMenuText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
    </TouchableOpacity>
);

export default function AdminWorkbenchScreen({ navigation }) {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();
    const [expandedSection, setExpandedSection] = useState(null);

    // Correct logic: Hide ONLY this screen's header, not the parent's
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
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
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
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
                <ActivityIndicator size="large" color={PRO_COLORS.iconBlue} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Workbench</Text>
                        <Text style={styles.headerSubtitle}>Manage & Control</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#1e3a8a" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. Add Users (Blue) */}
                    <MenuTile
                        index={0}
                        title="Add Users"
                        icon="person-add"
                        gradientColors={PRO_COLORS.corporateBlue}
                        expanded={expandedSection === 'addUsers'}
                        onPress={() => toggleSection('addUsers')}
                    >
                        <SubMenuItem label="Add Student" icon="person-add-outline" color={PRO_COLORS.iconBlue} onPress={() => nav('BoardSelectionScreen', { nextScreen: 'AddStudentScreen', title: 'Add Student' })} />
                        <SubMenuItem label="Add Faculty" icon="person-add-outline" color={PRO_COLORS.iconBlue} onPress={() => nav('AddFacultyScreen')} />
                    </MenuTile>

                    {/* 2. View Users (Teal - Alternate) */}
                    <MenuTile
                        index={1}
                        title="View Users"
                        icon="people"
                        gradientColors={PRO_COLORS.corporateTeal}
                        expanded={expandedSection === 'viewUsers'}
                        onPress={() => toggleSection('viewUsers')}
                    >
                        <SubMenuItem label="View Students" icon="school-outline" color={PRO_COLORS.iconTeal} onPress={() => nav('BoardSelectionScreen', { nextScreen: 'AllStudentsScreen', title: 'View Students' })} />
                        <SubMenuItem label="View Faculty" icon="people-outline" color={PRO_COLORS.iconTeal} onPress={() => nav('AllFacultyScreen')} />
                    </MenuTile>

                    {/* 3. Event Management (Blue) */}
                    <MenuTile
                        index={2}
                        title="Event Management"
                        icon="calendar"
                        gradientColors={PRO_COLORS.corporateBlue}
                        expanded={expandedSection === 'eventManagement'}
                        onPress={() => toggleSection('eventManagement')}
                    >
                        <SubMenuItem label="Add Event" icon="calendar-outline" color={PRO_COLORS.iconBlue} onPress={() => nav('AddEventScreen')} />
                    </MenuTile>

                    {/* 4. Subject Management (Teal - Alternate) */}
                    <MenuTile
                        index={3}
                        title="Subject Management"
                        icon="book"
                        gradientColors={PRO_COLORS.corporateTeal}
                        expanded={expandedSection === 'subjectManagement'}
                        onPress={() => toggleSection('subjectManagement')}
                    >
                        <SubMenuItem label="Add Subject Master" icon="book-outline" color={PRO_COLORS.iconTeal} onPress={() => nav('AddSubjectMasterScreen')} />
                        <SubMenuItem label="Assign Subject" icon="create-outline" color={PRO_COLORS.iconTeal} onPress={() => nav('AssignSubjectScreen')} />
                    </MenuTile>

                    {/* 5. Class Schedule (Blue) */}
                    <MenuTile
                        index={4}
                        title="Class Schedule"
                        icon="time"
                        gradientColors={PRO_COLORS.corporateBlue}
                        expanded={expandedSection === 'classSchedule'}
                        onPress={() => toggleSection('classSchedule')}
                    >
                        <SubMenuItem label="Manage Schedule" icon="calendar-outline" color={PRO_COLORS.iconBlue} onPress={() => nav('ClassScheduleScreen')} />
                        <SubMenuItem label="View Schedule" icon="eye-outline" color={PRO_COLORS.iconBlue} onPress={() => nav('ClassScheduleViewScreen')} />
                    </MenuTile>

                    {/* 6. Examination and Tests (Teal - Alternate) */}
                    <MenuTile
                        index={5}
                        title="Examination and Tests"
                        icon="clipboard"
                        gradientColors={PRO_COLORS.corporateTeal}
                        expanded={expandedSection === 'exams'}
                        onPress={() => toggleSection('exams')}
                    >
                        <SubMenuItem label="Exam Schedule" icon="calendar-number-outline" color={PRO_COLORS.iconTeal} onPress={() => Alert.alert('Coming Soon', 'Feature is under development')} />
                        <SubMenuItem label="Marks Entry" icon="pencil-outline" color={PRO_COLORS.iconTeal} onPress={() => nav('BoardSelectionScreen', { nextScreen: 'MarksEntryScreen', title: 'Marks Entry' })} />
                        <SubMenuItem label="Report Cards" icon="document-text-outline" color={PRO_COLORS.iconTeal} onPress={() => nav('BoardSelectionScreen', { nextScreen: 'ReportCardLandingScreen', title: 'Report Cards' })} />
                    </MenuTile>

                    {/* 7. Faculty Performance (Blue) */}
                    <MenuTile
                        index={6}
                        title="Faculty Performance"
                        icon="analytics"
                        gradientColors={PRO_COLORS.corporateBlue}
                        expanded={expandedSection === 'facultyPerformance'}
                        onPress={() => toggleSection('facultyPerformance')}
                    >
                        <SubMenuItem label="View Performance" icon="analytics-outline" color={PRO_COLORS.iconBlue} onPress={() => nav('FacultyPerformance')} />
                    </MenuTile>

                    {/* 8. Notices (Teal - Alternate) */}
                    <MenuTile
                        index={7}
                        title="Notices"
                        icon="megaphone"
                        gradientColors={PRO_COLORS.corporateTeal}
                        expanded={expandedSection === 'notices'}
                        onPress={() => toggleSection('notices')}
                    >
                        <SubMenuItem label="Add Notice" icon="megaphone-outline" color={PRO_COLORS.iconTeal} onPress={() => nav('AddNoticeScreen')} />
                    </MenuTile>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: PRO_COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: PRO_COLORS.background,
    },

    /* Header */
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: PRO_COLORS.textPrimary,
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: PRO_COLORS.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    logoutBtn: {
        padding: 10,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },

    /* Scroll Content */
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },

    /* Tile Styles */
    tileWrapper: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    tileContainer: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    tileGradient: {
        padding: 16,
        height: 72,
        justifyContent: 'center',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 1,
    },
    tileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    tileTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.3,
    },

    /* Dropdown Styles */
    dropdownContainer: {
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    dropdownInner: {
        padding: 16,
        paddingTop: 8,
        backgroundColor: '#ffffff',
    },
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 6,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    subIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    subMenuText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: PRO_COLORS.textPrimary,
    },
});
