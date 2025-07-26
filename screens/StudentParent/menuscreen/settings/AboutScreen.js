import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📘 About Us</Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Welcome to School-App</Text> — your all-in-one digital companion for managing every aspect of school life with ease.
        </Text>

        <Text style={styles.paragraph}>
          Our mission is to streamline communication, academic planning, and progress tracking among school administrators, faculty, students, and parents.
        </Text>

        <Text style={styles.subheading}>🌟 Why To Use App?</Text>

        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>📚 Efficient management of schedules, assignments, exams, and more</Text>
          <Text style={styles.bullet}>👨‍🏫 Real-time communication between teachers, students, and parents</Text>
          <Text style={styles.bullet}>🧾 Quick access to timetables, performance reports, and school notices</Text>
          <Text style={styles.bullet}>🔔 Instant alerts for important events and announcements</Text>
        </View>

        <Text style={styles.paragraph}>
          Built with a modern interface and smooth user experience, EduSync empowers schools to stay connected and organized like never before.
        </Text>

        <Text style={styles.footer}>
          Let’s make education smarter, simpler, and future-ready — together.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  bulletContainer: {
    marginBottom: 20,
  },
  bullet: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
    paddingLeft: 10,
  },
  footer: {
    fontSize: 16,
    color: '#0f172a',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
