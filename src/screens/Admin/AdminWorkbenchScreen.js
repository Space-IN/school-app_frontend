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

const PRO_COLORS = {
    background: '#F5F7FA',
    backgroundLight: '#FFFFFF',
    textPrimary: '#1A202C',
    textSecondary: '#64748B',
    border: '#E2E8F0',

    primaryGradient: ['#ac1d1d', '#8b1515'],
    warningGradient: ['#ef4444', '#dc2626'],
    
    accent: '#ac1d1d',
    accentLight: '#fecaca',
};

const MenuTile = ({ title, icon, gradientColors, onPress, expanded, children, index }) => {
    const heightAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

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

    const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
    const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const maxHeight = heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 600],
    });

    return (
        <Animated.View style={[styles.tileWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity activeOpacity={0.9} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
                <Animated.View style={[styles.tileContainer, { transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.tileGradient}>
                        <View style={styles.glassOverlay} />
                        <View style={styles.tileContent}>
                            <View style={styles.iconContainer}><Ionicons name={icon} size={26} color="#fff" /></View>
                            <View style={styles.textContainer}><Text style={styles.tileTitle}>{title}</Text></View>
                            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                                <Ionicons name={expanded ? "remove-outline" : "add-outline"} size={22} color="rgba(255,255,255,0.9)" />
                            </Animated.View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>

            <Animated.View style={[styles.dropdownContainer, { maxHeight: maxHeight, opacity: heightAnim }]}>
                <View style={styles.dropdownInner}>{children}</View>
            </Animated.View>
        </Animated.View>
    );
};

const SubMenuItem = ({ label, icon, onPress, color }) => (
    <TouchableOpacity style={styles.subMenuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.subIconBox, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.subMenuText}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color={PRO_COLORS.textSecondary} />
    </TouchableOpacity>
);

export default function AdminWorkbenchScreen({ navigation }) {
    const { logout } = useAuth();
    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const toggleSection = (section) => setExpandedSection(expandedSection === section ? null : section);
    const nav = (screen, params) => navigation.navigate(screen, params);

    const sections = [
        { key: 'addUsers', title: 'Add Users', icon: 'person-add', subItems: [
            { label: 'Add Student', icon: 'person-add-outline', screen: 'StudentEntryHubScreen' },
            { label: 'Add Faculty', icon: 'person-add-outline', screen: 'AddFacultyScreen' },
        ]},
        { key: 'viewUsers', title: 'View Users', icon: 'people', subItems: [
            { label: 'View Students', icon: 'school-outline', screen: 'BoardSelectionScreen', params: { nextScreen: 'AllStudentsScreen', title: 'View Students' } },
            { label: 'View Faculty', icon: 'people-outline', screen: 'AllFacultyScreen' },
        ]},
        { key: 'eventManagement', title: 'Event Management', icon: 'calendar', subItems: [
            { label: 'Add Event', icon: 'calendar-outline', screen: 'AddEventScreen' },
        ]},
        { key: 'subjectManagement', title: 'Subject Management', icon: 'book', subItems: [
            { label: 'Add Subject Master', icon: 'book-outline', screen: 'AddSubjectMasterScreen' },
            { label: 'Assign Subject', icon: 'create-outline', screen: 'AssignSubjectScreen' },
        ]},
        { key: 'classSchedule', title: 'Class Schedule', icon: 'time', subItems: [
            { label: 'Manage Schedule', icon: 'calendar-outline', screen: 'ClassScheduleScreen' },
            { label: 'View Schedule', icon: 'eye-outline', screen: 'ClassScheduleViewScreen' },
        ]},
        { key: 'exams', title: 'Examination & Tests', icon: 'clipboard', subItems: [
            { label: 'Exam Templates', icon: 'document-text-outline', screen: 'BoardSelectionScreen', params: { nextScreen: 'ExamTemplatesHomeScreen', title: 'Exam Templates' } },
            { label: 'Marks Entry', icon: 'pencil-outline', screen: 'BoardSelectionScreen', params: { nextScreen: 'MarksEntryScreen', title: 'Marks Entry' } },
            { label: 'Report Cards', icon: 'document-text-outline', screen: 'BoardSelectionScreen', params: { nextScreen: 'ReportCardLandingScreen', title: 'Report Cards' } },
        ]},
        { key: 'notices', title: 'Announcement', icon: 'megaphone', subItems: [
            { label: 'Add Announcement', icon: 'megaphone-outline', screen: 'AddNoticeScreen' },
        ]},
        { key: 'fees', title: 'Fee Management', icon: 'card', subItems: [
            { label: 'Manage Student Fees', icon: 'card-outline', screen: 'AdminFeesScreen' },
        ]},
    ];

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Workbench</Text>
                        <Text style={styles.headerSubtitle}>Manage & Control</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout}>
                        <LinearGradient colors={PRO_COLORS.warningGradient} style={styles.logoutBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <Ionicons name="log-out-outline" size={20} color="#fff" />
                            <Text style={styles.logoutBtnText}>Logout</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {sections.map((section, index) => (
                        <MenuTile
                            key={section.key}
                            index={index}
                            title={section.title}
                            icon={section.icon}
                            gradientColors={PRO_COLORS.primaryGradient}
                            expanded={expandedSection === section.key}
                            onPress={() => toggleSection(section.key)}
                        >
                            {section.subItems.map(item => (
                                <SubMenuItem 
                                    key={item.label}
                                    label={item.label} 
                                    icon={item.icon} 
                                    color={PRO_COLORS.textSecondary} 
                                    onPress={() => nav(item.screen, item.params)} 
                                />
                            ))}
                        </MenuTile>
                    ))}
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {width: 0, height: 2}
    },
    logoutBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },

    tileWrapper: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: PRO_COLORS.backgroundLight,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: PRO_COLORS.border,
    },
    tileContainer: {
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
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

    dropdownContainer: {
        overflow: 'hidden',
        backgroundColor: PRO_COLORS.backgroundLight,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    dropdownInner: {
        padding: 12,
        paddingTop: 8,
    },
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 6,
        borderRadius: 10,
        backgroundColor: PRO_COLORS.background,
        borderWidth: 1,
        borderColor: PRO_COLORS.border,
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