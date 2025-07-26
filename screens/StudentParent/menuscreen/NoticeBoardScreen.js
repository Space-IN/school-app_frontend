import React, { useEffect, useState, useRef, use } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import {io} from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NoticeBoardScreen = ({ route }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
 

   

 

useEffect(() => {
  const initialize = async () => {
    try {
      const stored = await AsyncStorage.getItem('userData');
      const parsed = stored ? JSON.parse(stored) : null;

      if (!parsed?.userId || !parsed?.role) {
        console.warn('User ID or role not found in AsyncStorage');
        return;
      }

      const normalizedRole = parsed.role.toLowerCase(); // 'student' or 'faculty'
      const id = parsed.userId;

      setUserId(id);
      setRole(normalizedRole);

      // 👇 API call based on role and ID
      const res = await axios.get(
        `http://10.221.34.141:5000/api/notices/user/${normalizedRole}/${id}`
      );
      setNotices(res.data);

      // 👇 Socket connection setup
      socketRef.current = io("http://10.221.34.141:5000", {
        query: { userId: id, role: normalizedRole },
      });

      socketRef.current.on("recieve_notice", (data) => {
        setNotices((prev) => [data, ...prev]);
      });
    } catch (err) {
      console.error("Error initializing NoticeBoard:", err);
    } finally {
      setLoading(false);
    }
  };

  initialize();

  return () => {
    socketRef.current?.disconnect();
  };
}, []);


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.noticeTitle}>{item.title}</Text>
      <Text style={styles.noticeMessage}>{item.message}</Text>
      <Text style={styles.noticeDate}>{new Date(item.date).toDateString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar backgroundColor="#4a90e2" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>📢 Notice Board</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default NoticeBoardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingVertical: 20,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  noticeMessage: {
    fontSize: 14,
    marginTop: 5,
    color: '#555',
  },
  noticeDate: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 10,
    color: '#888',
    textAlign: 'right',
  },
});
