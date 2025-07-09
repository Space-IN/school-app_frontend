import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

export default function ChatMessageScreen({ route }) {
  const { faculty } = route.params;
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const storageKey = `chat_${faculty.id || faculty.userId || faculty.name}`;

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem(storageKey);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    };
    loadMessages();
  }, []);

  const saveMessages = async (msgs) => {
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateLabel = (dateString) => {
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const msgDay = msgDate.toDateString();
    if (msgDay === today.toDateString()) return 'Today';
    if (msgDay === yesterday.toDateString()) return 'Yesterday';
    return msgDate.toLocaleDateString();
  };

  const handleDelete = (id) => {
    const updatedMessages = messages.filter((msg) => msg.id !== id);
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
  };

  const handleEdit = (msg) => {
    setInput(msg.text);
    setEditingMessageId(msg.id);
  };

  const confirmOptions = (msg) => {
    Alert.alert('Choose Option', 'Do you want to edit or delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit',
        onPress: () => handleEdit(msg),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Message', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              onPress: () => handleDelete(msg.id),
              style: 'destructive',
            },
          ]);
        },
      },
    ]);
  };

  const renderItem = ({ item, index }) => {
    const showDateSeparator =
      index === 0 ||
      getDateLabel(messages[index].timestamp) !==
        getDateLabel(messages[index - 1].timestamp);

    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateText}>{getDateLabel(item.timestamp)}</Text>
          </View>
        )}
        <TouchableOpacity
          onLongPress={() => confirmOptions(item)}
          onPress={() => {
            if (item.isAttachment && item.fileUri) {
              Linking.openURL(item.fileUri);
            }
          }}
        >
          <View
            style={[
              styles.messageBubble,
              item.sender === 'you' ? styles.sent : styles.received,
            ]}
          >
            <Text style={styles.messageText}>
              {item.isAttachment ? (
                <Text style={{ color: '#3b82f6' }}>{item.text}</Text>
              ) : (
                item.text
              )}
            </Text>
            <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const sendMessage = () => {
    if (input.trim() === '') return;

    if (editingMessageId) {
      const updatedMessages = messages.map((msg) =>
        msg.id === editingMessageId ? { ...msg, text: input } : msg
      );
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
      setEditingMessageId(null);
    } else {
      const newMsg = {
        id: Date.now().toString(),
        text: input,
        sender: 'you',
        timestamp: new Date().toISOString(),
        isAttachment: false,
      };

      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    }

    setInput('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.type === 'success') {
        const newMsg = {
          id: Date.now().toString(),
          text: `📎 ${result.name}`,
          fileUri: result.uri,
          fileType: result.mimeType,
          sender: 'you',
          timestamp: new Date().toISOString(),
          isAttachment: true,
        };

        const updatedMessages = [...messages, newMsg];
        setMessages(updatedMessages);
        saveMessages(updatedMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      console.error('Document picking error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <Text style={styles.header}>Chat with {faculty.name}</Text>

      {messages.length === 0 ? (
        <View style={styles.noChatContainer}>
          <Image
            source={require('../../../assets/chat-placeholder.png')}
            style={{ width: 100, height: 100, marginBottom: 20 }}
          />
          <Text style={styles.noChatText}>No messages yet.</Text>
          <Text style={styles.noChatText}>Start chatting below!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickDocument} style={styles.attachButton}>
          <Ionicons name="attach" size={24} color="#555" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons
            name={editingMessageId ? 'checkmark' : 'send'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2ff',
  },
  header: {
    padding: 16,
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#c7d2fe',
    textAlign: 'center',
    color: '#1e3a8a',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
    elevation: 2,
  },
  sent: {
    backgroundColor: '#dbeafe',
    alignSelf: 'flex-end',
  },
  received: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  sendButton: {
    marginLeft: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 10,
  },
  attachButton: {
    marginRight: 6,
  },
  noChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noChatText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginVertical: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#333',
  },
});
