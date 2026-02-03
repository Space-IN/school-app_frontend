import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    StatusBar,
    Dimensions,
    Alert,
    TouchableOpacity,
    Modal,
    FlatList,
    LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../api/api';
import { useAdmin } from '../../context/adminContext';

const { width } = Dimensions.get('window');

// --- School Theme Palette (Maroon/Burgundy) ---
const PRO_COLORS = {
    background: '#F5F7FA',
    backgroundLight: '#FFFFFF',
    textPrimary: '#1A202C',
    textSecondary: '#718096',
    textTertiary: '#A0AEC0',

    primaryGradient: ['#ac1d1d', '#8b1515'],
    successGradient: ['#059669', '#10b981'],
    warningGradient: ['#dc2626', '#ef4444'],
    infoGradient: ['#ac1d1d', '#c92a2a'],

    accent: '#ac1d1d',
    accentLight: '#fecaca',
    accentDark: '#7f1d1d',

    success: '#059669',
    successLight: '#D1FAE5',
    error: '#dc2626',
    errorLight: '#FEE2E2',

    border: '#E2E8F0',
    cardShadow: 'rgba(172, 29, 29, 0.1)',
};

export default function AdminInsightsScreen({ navigation }) {
    const { adminUserId } = useAdmin();

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({ headerShown: true, title: 'Admin Dashboard' });
            return () => {
                navigation.getParent()?.setOptions({ headerShown: false });
            };
        }, [navigation])
    );

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        upcomingEvents: [],
        recentActivities: [],
        overallAttendance: null,
    });

    const [attendanceGrade, setAttendanceGrade] = useState('');
    const [attendanceSection, setAttendanceSection] = useState('');
    const [attendanceBoard, setAttendanceBoard] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [checkingAttendance, setCheckingAttendance] = useState(false);
    const [showGradeModal, setShowGradeModal] = useState(false);
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showBoardModal, setShowBoardModal] = useState(false);

    const grades = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const sections = ['A', 'B', 'C', 'D'];
    const boards = ['All / None', 'CBSE', 'STATE'];

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        try {
            const results = await Promise.allSettled([
                api.get('/api/admin/students/count'),
                api.get('/api/admin/faculty/all'),
                api.get('/api/admin/events'),
                api.get('/api/admin/announcement/active'),
                api.get('/api/admin/attendance/overall'),
            ]);

            const [students, faculty, events, announcements, attendance] = results;

            setStats({
                totalStudents: students.status === 'fulfilled' ? students.value.data.count : 0,
                totalFaculty: faculty.status === 'fulfilled' ? faculty.value.data.length : 0,
                upcomingEvents: events.status === 'fulfilled' ? (events.value.data || []).filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date)) : [],
                recentActivities: announcements.status === 'fulfilled' ? (announcements.value.data || []).map(a => ({ id: a._id, text: a.title, time: new Date(a.date).toLocaleDateString() })) : [],
                overallAttendance: attendance.status === 'fulfilled' ? attendance.value.data.percentage : null
            });
        } catch (error) {
            console.error("Dashboard data fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkAttendanceStatus = async () => {
        if (!attendanceGrade || !attendanceSection || !attendanceBoard) {
            Alert.alert('Error', 'Please select Board, Grade, and Section');
            return;
        }

        setCheckingAttendance(true);
        setAttendanceStatus(null);
        try {
            const d = new Date();
            const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const res = await api.get('/api/admin/attendance', {
                params: {
                    grade: attendanceGrade,
                    section: attendanceSection,
                    board: attendanceBoard === 'All / None' ? '' : attendanceBoard,
                    date: today,
                }
            });

            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

            const attendanceList = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            const matchingDoc = attendanceList.find(doc => {
                const docGrade = String(doc.grade || doc.classAssigned || '').replace(/Grade\s?/i, '').trim();
                const docSection = String(doc.section || '').trim();
                return docGrade === String(attendanceGrade).trim() && docSection === String(attendanceSection).trim();
            });

            if (matchingDoc) {
                const details = [];
                if (matchingDoc.stats) {
                    if (matchingDoc.stats['1']) details.push(`Session 1: Present: ${matchingDoc.stats['1'].present}, Absent: ${matchingDoc.stats['1'].absent}`);
                    if (matchingDoc.stats['2']) details.push(`Session 2: Present: ${matchingDoc.stats['2'].present}, Absent: ${matchingDoc.stats['2'].absent}`);
                }
                setAttendanceStatus({ status: 'marked', message: '✅ Attendance Marked', details });
            } else {
                setAttendanceStatus({ status: 'not_marked', message: '❌ Not Marked Yet', details: [] });
            }
        } catch (err) {
            console.error("Attendance check error:", err);
            setAttendanceStatus({ status: 'error', message: '❌ Not Marked Yet (or Error)', details: [] });
        } finally {
            setCheckingAttendance(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={PRO_COLORS.accent} />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
    });

    const renderEventCard = ({ item, index }) => (
        <View style={[styles.eventCard, { marginLeft: index === 0 ? 0 : 16, width: width * 0.75 }]}>
            <View style={styles.eventDateBox}>
                <Text style={styles.eventDay}>{new Date(item.date).getDate()}</Text>
                <Text style={styles.eventMonth}>{new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
            </View>
            <View style={styles.eventContent}>
                <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.eventMeta}>
                    <Ionicons name="time-outline" size={14} color={PRO_COLORS.textSecondary} />
                    <Text style={styles.eventWeekday}>{new Date(item.date).toLocaleDateString(undefined, { weekday: 'long' })}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <LinearGradient colors={PRO_COLORS.primaryGradient} style={styles.headerCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <View style={styles.headerCardTop}>
                        <View>
                            <Text style={styles.headerGreeting}>Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}</Text>
                            <Text style={styles.headerAdminInfo}>{adminUserId ? `ID: ${adminUserId}` : 'Admin'}</Text>
                        </View>
                        <View style={styles.headerIconCircle}>
                            <Ionicons name="shield-checkmark" size={24} color={PRO_COLORS.accent} />
                        </View>
                    </View>
                    <View style={styles.headerCardBottom}>
                        <Text style={styles.headerRole}>Role: Admin</Text>
                        <Text style={styles.headerDate}>{currentDate}</Text>
                    </View>
                </LinearGradient>

                <View style={styles.statsContainer}>
                    <View style={[styles.statCard, { width: (width - 52) / 2 }]}>
                        <LinearGradient colors={PRO_COLORS.primaryGradient} style={styles.statGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <View style={styles.statIconWrapper}><Ionicons name="people" size={20} color="#fff" /></View>
                            <Text style={styles.statValue}>{stats.totalStudents || '0'}</Text>
                            <Text style={styles.statLabel}>Students</Text>
                        </LinearGradient>
                    </View>
                    <View style={[styles.statCard, { width: (width - 52) / 2 }]}>
                        <LinearGradient colors={['#7f1d1d', '#991b1b']} style={styles.statGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                            <View style={styles.statIconWrapper}><Ionicons name="briefcase" size={20} color="#fff" /></View>
                            <Text style={styles.statValue}>{stats.totalFaculty || '0'}</Text>
                            <Text style={styles.statLabel}>Faculty</Text>
                        </LinearGradient>
                    </View>
                </View>

                <View style={styles.attendanceOverviewCard}>
                    <View style={styles.attendanceHeader}>
                        <View style={styles.attendanceIconBg}><Ionicons name="bar-chart" size={20} color={PRO_COLORS.accent} /></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.attendanceTitle}>Overall Attendance</Text>
                            <Text style={styles.attendanceSubtitle}>Today's Performance</Text>
                        </View>
                        <View style={styles.attendancePercentageBox}>
                            <Text style={styles.attendancePercentage}>{stats.overallAttendance ? `${stats.overallAttendance}%` : 'N/A'}</Text>
                        </View>
                    </View>
                    {stats.overallAttendance && (
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBg}>
                                <LinearGradient colors={stats.overallAttendance >= 75 ? PRO_COLORS.successGradient : PRO_COLORS.primaryGradient} style={[styles.progressBarFill, { width: `${stats.overallAttendance}%` }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                            </View>
                        </View>
                    )}
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Attendance Checker</Text>
                    <View style={styles.toolCard}>
                        <View style={styles.toolHeader}>
                            <View style={styles.toolIconBg}>
                                <Ionicons name="search" size={18} color={PRO_COLORS.accent} />
                            </View>
                            <Text style={styles.toolHeaderText}>Quick Verification</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <TouchableOpacity style={styles.selectButton} onPress={() => setShowBoardModal(true)}>
                                <Ionicons name="library" size={18} color={attendanceBoard ? PRO_COLORS.accent : PRO_COLORS.textTertiary} />
                                <Text style={[styles.selectButtonText, attendanceBoard && styles.selectButtonTextActive]}>{attendanceBoard || 'Select Board'}</Text>
                                <Ionicons name="chevron-down" size={16} color={PRO_COLORS.textTertiary} />
                            </TouchableOpacity>

                            <View style={styles.inputRow}>
                                <TouchableOpacity style={[styles.selectButton, styles.selectButtonHalf]} onPress={() => setShowGradeModal(true)}>
                                    <Ionicons name="ribbon" size={16} color={attendanceGrade ? PRO_COLORS.accent : PRO_COLORS.textTertiary} />
                                    <Text style={[styles.selectButtonText, styles.selectButtonTextSmall, attendanceGrade && styles.selectButtonTextActive]}>{attendanceGrade ? `Grade ${attendanceGrade}` : 'Grade'}</Text>
                                    <Ionicons name="chevron-down" size={14} color={PRO_COLORS.textTertiary} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.selectButton, styles.selectButtonHalf]} onPress={() => setShowSectionModal(true)}>
                                    <Ionicons name="apps" size={16} color={attendanceSection ? PRO_COLORS.accent : PRO_COLORS.textTertiary} />
                                    <Text style={[styles.selectButtonText, styles.selectButtonTextSmall, attendanceSection && styles.selectButtonTextActive]}>{attendanceSection ? `Sec ${attendanceSection}` : 'Section'}</Text>
                                    <Ionicons name="chevron-down" size={14} color={PRO_COLORS.textTertiary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.verifyButton} onPress={checkAttendanceStatus} disabled={checkingAttendance}>
                            <LinearGradient colors={PRO_COLORS.primaryGradient} style={styles.verifyButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                {checkingAttendance ? <ActivityIndicator color="#fff" size="small" /> : (<>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.verifyButtonText}>Verify Attendance</Text>
                                </>)}
                            </LinearGradient>
                        </TouchableOpacity>

                        {attendanceStatus && (
                            <View style={[styles.statusCard, attendanceStatus.status === 'marked' ? styles.statusCardSuccess : styles.statusCardError]}>
                                <View style={styles.statusHeader}>
                                    <View style={[styles.statusIconBg, attendanceStatus.status === 'marked' ? styles.statusIconBgSuccess : styles.statusIconBgError]}>
                                        <Ionicons name={attendanceStatus.status === 'marked' ? "checkmark" : "close"} size={16} color={attendanceStatus.status === 'marked' ? PRO_COLORS.success : PRO_COLORS.error} />
                                    </View>
                                    <Text style={[styles.statusMessage, attendanceStatus.status === 'marked' ? styles.statusMessageSuccess : styles.statusMessageError]}>{attendanceStatus.message}</Text>
                                </View>
                                {attendanceStatus.details && attendanceStatus.details.length > 0 && (
                                    <View style={styles.statusDetails}>
                                        {attendanceStatus.details.map((line, idx) => (
                                            <View key={idx} style={styles.statusDetailRow}>
                                                <View style={styles.statusBullet} />
                                                <Text style={styles.statusDetailText}>{line}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Upcoming Events</Text><Ionicons name="calendar-outline" size={20} color={PRO_COLORS.textSecondary} /></View>
                    {stats.upcomingEvents.length > 0 ? (
                        <FlatList data={stats.upcomingEvents} horizontal showsHorizontalScrollIndicator={false} keyExtractor={(item) => item._id} renderItem={renderEventCard} contentContainerStyle={{ paddingHorizontal: 20 }} style={{ marginHorizontal: -20 }} />
                    ) : (
                        <View style={styles.emptyState}><View style={styles.emptyIconBg}><Ionicons name="calendar-outline" size={28} color={PRO_COLORS.textTertiary} /></View><Text style={styles.emptyText}>No upcoming events</Text></View>
                    )}
                </View>

                <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Recent Activity</Text><Ionicons name="notifications-outline" size={20} color={PRO_COLORS.textSecondary} /></View>
                    {stats.recentActivities.length > 0 ? (
                        <View style={styles.activityContainer}>
                            {stats.recentActivities.map((activity, index) => (
                                <View key={activity.id || index} style={styles.activityCard}>
                                    <View style={styles.activityIcon}><Ionicons name="megaphone-outline" size={20} color={PRO_COLORS.accent} /></View>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityText}>{activity.text}</Text>
                                        <Text style={styles.activityTime}>{activity.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.emptyState}><View style={styles.emptyIconBg}><Ionicons name="notifications-off-outline" size={28} color={PRO_COLORS.textTertiary} /></View><Text style={styles.emptyText}>No recent activity</Text></View>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <Modal visible={showGradeModal} transparent={true} animationType="fade" onRequestClose={() => setShowGradeModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowGradeModal(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Select Grade</Text><TouchableOpacity onPress={() => setShowGradeModal(false)}><Ionicons name="close-circle" size={24} color={PRO_COLORS.textTertiary} /></TouchableOpacity></View>
                        <FlatList data={grades} keyExtractor={(item) => item} renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => { setAttendanceGrade(item); setShowGradeModal(false); }}>
                                <Ionicons name="ribbon-outline" size={18} color={PRO_COLORS.accent} />
                                <Text style={styles.modalItemText}>Grade {item}</Text>
                                {attendanceGrade === item && <Ionicons name="checkmark-circle" size={20} color={PRO_COLORS.success} />}
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal visible={showSectionModal} transparent={true} animationType="fade" onRequestClose={() => setShowSectionModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSectionModal(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Select Section</Text><TouchableOpacity onPress={() => setShowSectionModal(false)}><Ionicons name="close-circle" size={24} color={PRO_COLORS.textTertiary} /></TouchableOpacity></View>
                        <FlatList data={sections} keyExtractor={(item) => item} renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => { setAttendanceSection(item); setShowSectionModal(false); }}>
                                <Ionicons name="apps-outline" size={18} color={PRO_COLORS.accent} />
                                <Text style={styles.modalItemText}>Section {item}</Text>
                                {attendanceSection === item && <Ionicons name="checkmark-circle" size={20} color={PRO_COLORS.success} />}
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal visible={showBoardModal} transparent={true} animationType="fade" onRequestClose={() => setShowBoardModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowBoardModal(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Select Board</Text><TouchableOpacity onPress={() => setShowBoardModal(false)}><Ionicons name="close-circle" size={24} color={PRO_COLORS.textTertiary} /></TouchableOpacity></View>
                        <FlatList data={boards} keyExtractor={(item) => item} renderItem={({ item }) => (
                            <TouchableOpacity style={styles.modalItem} onPress={() => { setAttendanceBoard(item); setShowBoardModal(false); }}>
                                <Ionicons name="library-outline" size={18} color={PRO_COLORS.accent} />
                                <Text style={styles.modalItemText}>{item}</Text>
                                {attendanceBoard === item && <Ionicons name="checkmark-circle" size={20} color={PRO_COLORS.success} />}
                            </TouchableOpacity>
                        )} />
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: PRO_COLORS.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: PRO_COLORS.background },
    loadingText: { marginTop: 12, fontSize: 14, color: PRO_COLORS.textSecondary, fontWeight: '500' },
    scrollContent: { paddingHorizontal: 16, paddingVertical: 20, paddingBottom: 40 },

    headerCard: { borderRadius: 20, padding: 24, marginBottom: 24, elevation: 8, shadowColor: PRO_COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    headerCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    headerGreeting: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' },
    headerAdminInfo: { fontSize: 24, color: '#fff', fontWeight: '800', marginTop: 4 },
    headerIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255, 255, 255, 0.9)', alignItems: 'center', justifyContent: 'center' },
    headerCardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.2)', paddingTop: 16 },
    headerRole: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', backgroundColor: 'rgba(255, 255, 255, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
    headerDate: { fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' },

    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statCard: { borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
    statGradient: { padding: 16, minHeight: 120, justifyContent: 'flex-end' },
    statIconWrapper: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    statValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
    statLabel: { fontSize: 13, color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600', marginTop: 4 },

    attendanceOverviewCard: { backgroundColor: PRO_COLORS.backgroundLight, borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: PRO_COLORS.border },
    attendanceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    attendanceIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: PRO_COLORS.accentLight, alignItems: 'center', justifyContent: 'center' },
    attendanceTitle: { fontSize: 16, fontWeight: '700', color: PRO_COLORS.textPrimary },
    attendanceSubtitle: { fontSize: 12, color: PRO_COLORS.textSecondary, marginTop: 2 },
    attendancePercentageBox: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, backgroundColor: PRO_COLORS.accentLight },
    attendancePercentage: { fontSize: 16, fontWeight: '800', color: PRO_COLORS.accent },
    progressBarContainer: { marginTop: 4 },
    progressBarBg: { height: 8, backgroundColor: PRO_COLORS.background, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    sectionContainer: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 19, fontWeight: '700', color: PRO_COLORS.textPrimary },

    toolCard: { backgroundColor: PRO_COLORS.backgroundLight, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: PRO_COLORS.border },
    toolHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, },
    toolIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: PRO_COLORS.accentLight, alignItems: 'center', justifyContent: 'center', marginRight: 12, },
    toolHeaderText: { fontSize: 16, fontWeight: '700', color: PRO_COLORS.textPrimary, },
    inputContainer: { marginBottom: 16, },
    selectButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRO_COLORS.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: PRO_COLORS.border, marginBottom: 12, },
    selectButtonHalf: { flex: 1, marginRight: 8, marginBottom: 0, },
    selectButtonText: { flex: 1, marginLeft: 10, fontSize: 14, color: PRO_COLORS.textTertiary, fontWeight: '500', },
    selectButtonTextSmall: { fontSize: 13, },
    selectButtonTextActive: { color: PRO_COLORS.textPrimary, fontWeight: '600', },
    inputRow: { flexDirection: 'row', },
    verifyButton: { borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: PRO_COLORS.accent, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 5, },
    verifyButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, },
    verifyButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8, },
    statusCard: { marginTop: 16, padding: 16, borderRadius: 16, borderWidth: 1.5, },
    statusCardSuccess: { backgroundColor: PRO_COLORS.successLight, borderColor: PRO_COLORS.success, },
    statusCardError: { backgroundColor: PRO_COLORS.errorLight, borderColor: PRO_COLORS.error, },
    statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, },
    statusIconBg: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12, },
    statusIconBgSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.15)', },
    statusIconBgError: { backgroundColor: 'rgba(239, 68, 68, 0.15)', },
    statusMessage: { fontSize: 15, fontWeight: '700', },
    statusMessageSuccess: { color: PRO_COLORS.success, },
    statusMessageError: { color: PRO_COLORS.error, },
    statusDetails: { paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0, 0, 0, 0.08)', },
    statusDetailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, },
    statusBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: PRO_COLORS.textSecondary, marginRight: 10, marginTop: 6, },
    statusDetailText: { flex: 1, fontSize: 13, color: PRO_COLORS.textSecondary, lineHeight: 18, fontWeight: '500', },

    eventCard: { backgroundColor: PRO_COLORS.backgroundLight, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: PRO_COLORS.border },
    eventDateBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: PRO_COLORS.accentLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    eventDay: { fontSize: 20, fontWeight: '800', color: PRO_COLORS.accent },
    eventMonth: { fontSize: 10, fontWeight: '700', color: PRO_COLORS.accent, marginTop: 2 },
    eventContent: { flex: 1 },
    eventTitle: { fontSize: 15, fontWeight: '700', color: PRO_COLORS.textPrimary, marginBottom: 4 },
    eventMeta: { flexDirection: 'row', alignItems: 'center' },
    eventWeekday: { fontSize: 13, color: PRO_COLORS.textSecondary, marginLeft: 6 },

    activityContainer: { gap: 12 },
    activityCard: { backgroundColor: PRO_COLORS.backgroundLight, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: PRO_COLORS.border },
    activityIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: PRO_COLORS.accentLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    activityContent: { flex: 1 },
    activityText: { fontSize: 14, color: PRO_COLORS.textPrimary, fontWeight: '600', marginBottom: 4, lineHeight: 20 },
    activityTime: { fontSize: 12, color: PRO_COLORS.textSecondary },

    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, backgroundColor: PRO_COLORS.backgroundLight, borderRadius: 16, borderWidth: 1, borderColor: PRO_COLORS.border, },
    emptyIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: PRO_COLORS.background, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    emptyText: { fontSize: 14, color: PRO_COLORS.textTertiary, fontWeight: '500' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, },
    modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, maxHeight: '70%', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: PRO_COLORS.border, },
    modalTitle: { fontSize: 20, fontWeight: '700', color: PRO_COLORS.textPrimary, },
    modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, backgroundColor: PRO_COLORS.background, },
    modalItemText: { flex: 1, fontSize: 15, color: PRO_COLORS.textPrimary, fontWeight: '600', marginLeft: 12, },
});