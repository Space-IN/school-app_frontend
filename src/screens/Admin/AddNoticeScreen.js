import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Linking,
  Modal,
  Pressable
} from "react-native";
import axios from "axios";
import { io } from "socket.io-client";
import * as DocumentPicker from 'expo-document-picker';
import { BASE_URL } from '@env';

const AddNoticeScreen = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [specificIds, setSpecificIds] = useState("");
  const [notices, setNotices] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');


  const socket = io(BASE_URL);

  const fetchNotices = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/notices/`);
      setNotices(res.data || []);
    } catch (error) {
      console.error("Error fetching notices:", error);
      Alert.alert("Error", "Failed to load notices");
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // const handleAddNotice = async () => {
  //   if (!title || !message) {
  //     Alert.alert("Error", "Title and message are required");
  //     return;
  //   }

  //   try {
  //     await axios.post(`${BASE_URL}/api/notices/add`, {
  //       title,
  //       message,
  //       target,
  //       specificIds: target === "specific" ? specificIds.split(",") : [],
  //     });

  //     // socket.emit("new_notice", {
  //     //   title,
  //     //   message,
  //     //   target,
  //     //   specificIds: target === "specific" ? specificIds.split(",") : [],
  //     // });

  //     Alert.alert("Success", "Notice added successfully");
  //     setTitle("");
  //     setMessage("");
  //     setTarget("all");
  //     setSpecificIds("");
  //     fetchNotices(); // refresh list
  //   } catch (error) {
  //     console.error("Error adding notice:", error);
  //     Alert.alert("Error", "Failed to add notice");
  //   }
  // };

  const handleAddNotice = async () => {
  const formData = new FormData();

  formData.append('title', title);
  formData.append('message', message);
  formData.append('target', target);

  if (target === 'specific') {
    formData.append('specificIds', JSON.stringify(specificIds.split(',')));
  }

  if (selectedFile) {
    const response = await fetch(selectedFile.uri);
    const blob = await response.blob();

    formData.append('file', {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || 'application/octet-stream',
      
    });
  }

  try {
    console.log("Selected file:", selectedFile);

    await axios.post(`${BASE_URL}/api/notices/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });

    Alert.alert('Success', 'Notice added');
    setTitle('');
    setMessage('');
    setTarget('all');
    setSpecificIds('');
    setSelectedFile(null);
    fetchNotices();
  } catch (err) {
    console.error('Upload failed:', err);
    Alert.alert('Upload Error', 'Failed to upload notice');
  }
};

  const handleDeleteNotice = async (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this notice?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/notices/delete/${id}`);
            fetchNotices(); 
            Alert.alert("Deleted", "Notice deleted successfully");
          } catch (error) {
            console.error("Error deleting notice:", error);
            Alert.alert("Error", "Failed to delete notice");
          }
        },
      },
    ]);
  };

const pickFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    console.log("DocumentPicker result:", result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setSelectedFile({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType,
      });
    } else {
      setSelectedFile(null); 
    }
  } catch (err) {
    console.error("Error picking file:", err);
    Alert.alert("Error", "Could not pick file.");
  }
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add Notice</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Message"
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <Text style={styles.label}>Send To:</Text>

      {["all", "students", "faculty"].map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.radio, target === option && styles.selectedRadio]}
          onPress={() => setTarget(option)}
        >
          <Text>{option.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}

      {target === "specific" && (
        <TextInput
          style={styles.input}
          placeholder="Enter User IDs (comma-separated)"
          value={specificIds}
          onChangeText={setSpecificIds}
        />
      )}
      {/* <TouchableOpacity
  style={[styles.button, { backgroundColor: '#6c757d', marginBottom: 10 }]}
  onPress={pickFile}
>
  <Text style={styles.buttonText}>
    {selectedFile ? `📎 ${selectedFile.name}` : 'Attach File (optional)'}
  </Text>

  
</TouchableOpacity> */}

<TouchableOpacity
  style={[styles.button, { backgroundColor: '#6c757d', marginBottom: 10 }]}
  onPress={pickFile}
>
  <Text style={styles.buttonText}>
    {selectedFile ? `📎 ${selectedFile.name}` : 'Attach File (optional)'}
  </Text>
</TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleAddNotice}>
        <Text style={styles.buttonText}>Add Notice</Text>
      </TouchableOpacity>

      <Text style={[styles.heading, { marginTop: 30 }]}>Existing Notices</Text>

      {notices.map((notice) => (
        <View key={notice._id} style={styles.noticeCard}>

          <Text style={styles.noticeDate}>
            {new Date(notice.date).toLocaleString()}
          </Text>

          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeMessage}>{notice.message}</Text>
          <Text style={styles.noticeTarget}>Target: {notice.target}</Text>


      {notice.fileUrl && (
  <>
    {notice.fileUrl.endsWith('.pdf') ? (
      <TouchableOpacity
        onPress={() => {
          const filename = notice.fileUrl.split('/').pop();
          setPreviewUrl(`${BASE_URL}/api/notices/preview/${filename}`);

          setPreviewVisible(true);
        }}
        style={{
          backgroundColor: '#007bff',
          padding: 10,
          borderRadius: 5,
          marginTop: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>📄 Preview PDF</Text>
      </TouchableOpacity>
    ) : (
      <Text
        style={{
          color: '#007bff',
          textDecorationLine: 'underline',
          marginTop: 5,
        }}
        onPress={() => Linking.openURL(`${BASE_URL}/${notice.fileUrl}`)}
      >
        📎 Open Attachment
      </Text>
    )}
  </>
)}

          <TouchableOpacity
            onPress={() => handleDeleteNotice(notice._id)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      ))}

<Modal
  visible={previewVisible}
  animationType="slide"
  onRequestClose={() => setPreviewVisible(false)}
>
  <View style={{ flex: 1 }}>
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        padding: 10,
      }}
    >
      <Pressable
        onPress={() => setPreviewVisible(false)}
        style={{
          backgroundColor: '#dc3545',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
      </Pressable>

      <Pressable
        onPress={() => {
          Linking.openURL(previewUrl);
        }}
        style={{
          backgroundColor: '#28a745',
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Download</Text>
      </Pressable>
    </View>

    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
        {previewUrl.split('/').pop()}
      </Text>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};

export default AddNoticeScreen;

const styles = StyleSheet.create({
  container: { 
    padding: 30,
    backgroundColor: "#bbdbfaff", 
    flexGrow: 1, 
  },
  heading: { fontSize: 24, marginBottom: 15, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#fff", 
  },
  label: { fontWeight: "bold", marginBottom: 5 },
  radio: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  selectedRadio: { backgroundColor: "#cce5ff" },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },

  noticeCard: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  noticeTitle: { fontWeight: "bold", fontSize: 16 },
  noticeMessage: { marginVertical: 5 },
  noticeTarget: { fontStyle: "italic", color: "#333" },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#ffdddd",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteText: { color: "#d00", fontWeight: "bold" },
 
  noticeDate: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
    fontStyle: "italic",
  },
});

