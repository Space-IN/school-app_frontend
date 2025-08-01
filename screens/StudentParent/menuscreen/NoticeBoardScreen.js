import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

import BASE_URL from '../../../config/baseURL';

const NoticeBoardScreen = () => {
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
 

  // For PDF modal
  const [modalVisible, setModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const openPdfModal = (url) => {
    console.log("Opening PDF:", url);
    setPdfUrl(url);
    setModalVisible(true);
  };

  const closePdfModal = () => {
    setModalVisible(false);
    setPdfUrl('');
  };
 

  useEffect(() => {
    const initialize = async () => {
      try {
        const stored = await AsyncStorage.getItem('userData');
        const parsed = stored ? JSON.parse(stored) : null;

        if (!parsed?.userId || !parsed?.role) {
          console.warn('User ID or role not found in AsyncStorage');
          return;
        }

        const rawRole = parsed.role.toLowerCase(); // 'student', 'faculty'
        const roleMapped = rawRole === "student" ? "students" : rawRole;

 
      // 👇 API call based on role and ID
      const res = await axios.get(
        `http://10.221.34.141:5000/api/notices/user/${normalizedRole}/${id}`
      );
      setNotices(res.data);

      // 👇 Socket connection setup
      socketRef.current = io("http://10.221.34.141:5000", {
        query: { userId: id, role: normalizedRole },
      });
 
        setUserId(parsed.userId);
        setRole(roleMapped);

        console.log("Fetching from:", `${BASE_URL}/api/notices/user/${roleMapped}/${parsed.userId}`);

        const res = await axios.get(
          `${BASE_URL}/api/notices/user/${roleMapped}/${parsed.userId}`
        );
        // console.log("Fetched notices:", res.data); 


        setNotices(res.data);

        // Setup socket
        socketRef.current = io(BASE_URL, {
          query: { userId: parsed.userId, role: roleMapped },
        });
 

        socketRef.current.on("recieve_notice", (data) => {
          setNotices((prev) => [data, ...prev]);
        });

        socketRef.current.on("notice_deleted", (deletedId) => {
          setNotices((prev) => prev.filter((notice) => notice._id !== deletedId));
        });

      } catch (err) {
        console.error("Error initializing NoticeBoard:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();

 
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.noticeTitle}>{item.title}</Text>
      <Text style={styles.noticeMessage}>{item.message}</Text>
      <Text style={styles.noticeDate}>{new Date(item.date).toDateString()}</Text>
    </View>
 
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const renderItem = ({ item }) => {

      console.log("Original file path from DB:", item.fileUrl);

    const fileUrl = item.fileUrl ? `${BASE_URL}${item.fileUrl}` : null;
    const isPdf = fileUrl?.toLowerCase().endsWith('.pdf');
    console.log("Rendering item:", fileUrl);

    

    return (
      <View style={styles.card}>
        <Text style={styles.noticeTitle}>{item.title}</Text>
        <Text style={styles.noticeMessage}>{item.message}</Text>
        <Text style={styles.noticeDate}>
          {(() => {
            try {
              return new Date(item.date).toDateString();
            } catch {
              return "Invalid Date";
            }
          })()}
        </Text>

        {fileUrl && (
          isPdf ? (
            <TouchableOpacity
              style={styles.previewButton}
              onPress={() => openPdfModal(fileUrl)}
            >
              
              <Text style={styles.previewButtonText}>📄 Preview PDF</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => Linking.openURL(fileUrl)}>
              <Text style={styles.linkText}>📎 Open Attachment</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    );
  };
 

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

     {/* PDF Modal */}
<Modal
  animationType="slide"
  visible={modalVisible}
  onRequestClose={closePdfModal}
  transparent={true}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>📄 PDF Attachment</Text>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => Linking.openURL(pdfUrl)}
      >
        <Text style={styles.downloadButtonText}>⬇️ Download PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeModalButton}
        onPress={closePdfModal}
      >
        <Text style={styles.closeModalButtonText}>✖ Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>



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
  linkText: {
    color: 'blue',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  previewButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  previewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalHeader: {
    padding: 10,
    backgroundColor: '#000',
    alignItems: 'flex-end',
  },
  closeButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  width: '80%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 20,
  alignItems: 'center',
  elevation: 5,
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 20,
},
downloadButton: {
  backgroundColor: '#28a745',
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  marginBottom: 10,
},
downloadButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},
closeModalButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  backgroundColor: '#dc3545',
  borderRadius: 8,
},
closeModalButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},

});
