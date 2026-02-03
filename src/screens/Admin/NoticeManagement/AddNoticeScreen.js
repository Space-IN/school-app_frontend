import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from "../../../api/api";

const PRO_COLORS = {
  background: '#F5F7FA',
  backgroundLight: '#fecaca',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  border: '#E2E8F0',
  primaryGradient: ['#ac1d1d', '#8b1515'],
  accent: '#ac1d1d',
  accentLight: '#fecaca',
  error: '#dc2626',
};

const AddNoticeScreen = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [notices, setNotices] = useState([]);

  const fetchNotices = async () => {
    try {
      const res = await api.get(`/api/admin/announcement/`);
      setNotices(res.data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      Alert.alert("Error", "Failed to load notices");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleAddNotice = async () => {
    if (!title || !message) {
      Alert.alert('Validation Error', 'Title and Message are required.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    formData.append('target', target);

    try {
      await api.post(`/api/admin/announcement/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Notice added successfully');
      setTitle('');
      setMessage('');
      setTarget('all');
      fetchNotices();
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Upload Error', 'Failed to upload notice. Please try again.');
    }
  };

  const handleDeleteNotice = (id) => {
    Alert.alert(
      "Delete Notice",
      "Are you sure you want to delete this notice? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/admin/announcement/delete/${id}`);
              fetchNotices();
              Alert.alert("Deleted", "Notice has been deleted.");
            } catch (error) {
              console.error("Error deleting notice:", error);
              Alert.alert("Error", "Failed to delete notice.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.heading}>Create a New Announcement</Text>

          <TextInput
            style={styles.input}
            placeholder="Announcement Title"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Announcement Message"
            multiline
            value={message}
            onChangeText={setMessage}
          />

          <Text style={styles.label}>Target Audience</Text>
          <View style={styles.radioContainer}>
            {["all", "students", "faculty"].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.radio,
                  target === option && styles.selectedRadio,
                ]}
                onPress={() => setTarget(option)}
              >
                <Text
                  style={[
                    styles.radioText,
                    target === option && styles.selectedRadioText,
                  ]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleAddNotice}>
            <LinearGradient colors={PRO_COLORS.primaryGradient} style={styles.button}>
              <Ionicons name="megaphone-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Publish Announcement</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Published Announcement</Text>

          {notices.length === 0 ? (
            <Text style={styles.emptyText}>No Announcements found.</Text>
          ) : (
            notices.map((notice) => (
              <View key={notice._id} style={styles.noticeCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.noticeDate}>
                    {new Date(notice.date).toLocaleString()}
                  </Text>
                  <Text style={styles.noticeMessage}>{notice.message}</Text>
                  <Text style={styles.noticeTarget}>
                    Target: {notice.target}
                  </Text>
                </View>

                <View style={styles.noticeActions}>
                  <TouchableOpacity
                    onPress={() => handleDeleteNotice(notice._id)}
                    style={[
                      styles.actionButton,
                      { backgroundColor: PRO_COLORS.accentLight },
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={PRO_COLORS.error}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PRO_COLORS.background },
  container: { padding: 16 },
  card: {
    backgroundColor: PRO_COLORS.backgroundLight,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: PRO_COLORS.border,
  },
  heading: { fontSize: 20, fontWeight: "700", color: PRO_COLORS.accent, marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: PRO_COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: PRO_COLORS.background,
    fontSize: 16,
    color: PRO_COLORS.textPrimary,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  label: { fontWeight: "600", color: PRO_COLORS.textSecondary, marginBottom: 8 },
  radioContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  radio: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: PRO_COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: PRO_COLORS.border,
  },
  selectedRadio: { backgroundColor: PRO_COLORS.accentLight, borderColor: PRO_COLORS.accent },
  radioText: { color: PRO_COLORS.textPrimary, fontWeight: '600' },
  selectedRadioText: { color: PRO_COLORS.accent, fontWeight: '700' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 14,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 8 },
  emptyText: { color: PRO_COLORS.textSecondary, textAlign: 'center', marginVertical: 20 },

  noticeCard: {
    backgroundColor: PRO_COLORS.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: PRO_COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeTitle: { fontWeight: "bold", fontSize: 16, color: PRO_COLORS.textPrimary },
  noticeMessage: { marginVertical: 4, color: PRO_COLORS.textSecondary },
  noticeTarget: { fontStyle: "italic", color: '#64748b', marginTop: 4 },
  noticeDate: { fontSize: 12, color: PRO_COLORS.textSecondary, marginBottom: 5 },
  noticeActions: { flexDirection: 'column' },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});

export default AddNoticeScreen;
