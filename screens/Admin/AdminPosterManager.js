import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import BASE_URL from '../../config/baseURL';

export default function AdminPosterManager() {
  const [poster, setPoster] = useState({
    type: 'academic',
    title: '',
    description: '',
    imageUrl: '',
  });

  const [posters, setPosters] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow media access in settings');
      }
    })();

    fetchPosters();
  }, []);

  const fetchPosters = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/posters/all`);
      setPosters(res.data);
    } catch (err) {
      console.error('❌ Fetch error:', err.message);
      Alert.alert('Error', 'Failed to load posters');
    }
  };

  const deletePoster = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/posters/delete/${id}`);
      fetchPosters(); // Refresh list
    } catch (err) {
      console.error('❌ Delete error:', err.message);
      Alert.alert('Error', 'Failed to delete poster');
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Poster',
      'Are you sure you want to delete this poster?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deletePoster(id) },
      ]
    );
  };

  const handleChange = (field, value) => {
    setPoster({ ...poster, [field]: value });
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker?.MediaType?.IMAGE || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const imageUri = result.assets[0].uri;

        const formData = new FormData();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'poster.jpg',
        });

        const res = await axios.post(`${BASE_URL}/api/posters/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const uploadedUrl = res.data.imageUrl;
        setPoster((prev) => ({ ...prev, imageUrl: uploadedUrl }));
      }
    } catch (err) {
      console.error('❌ Upload error:', err.message, err.response?.data);
      Alert.alert('Upload Failed', err.response?.data?.message || 'Server error during image upload');
    }
  };

  const handleSubmit = async () => {
    if (!poster.title.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/posters/add`, poster);
      Alert.alert('✅ Success', res.data.message);
      setPoster({ type: 'academic', title: '', description: '', imageUrl: '' });
      fetchPosters(); // Refresh list after new addition
    } catch (err) {
      console.error('❌ Submit error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to add poster');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add New Poster</Text>

      <Text style={styles.label}>Type</Text>
      <Picker
        selectedValue={poster.type}
        onValueChange={(value) => handleChange('type', value)}
        style={styles.picker}
      >
        <Picker.Item label="Academic Update" value="academic" />
        <Picker.Item label="Event" value="event" />
        <Picker.Item label="Text Notice" value="text" />
      </Picker>

      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={poster.title}
        onChangeText={(text) => handleChange('title', text)}
        placeholder="Poster title"
      />

      <Text style={styles.label}>Description (Optional)</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        value={poster.description}
        onChangeText={(text) => handleChange('description', text)}
        multiline
      />

      <Text style={styles.label}>Paste Image URL (Optional)</Text>
      <TextInput
        style={styles.input}
        value={poster.imageUrl}
        onChangeText={(text) => handleChange('imageUrl', text)}
        placeholder="https://example.com/poster.jpg"
      />

      <TouchableOpacity style={styles.uploadBtn} onPress={handleImagePick}>
        <Text style={styles.uploadText}>📁 Pick Image from Device</Text>
      </TouchableOpacity>

      {poster.imageUrl ? (
        <Image source={{ uri: poster.imageUrl }} style={styles.previewImage} />
      ) : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Poster</Text>
      </TouchableOpacity>

      {/* 🟦 Poster List Section */}
      <Text style={[styles.heading, { marginTop: 30 }]}>📰 Current Posters</Text>
      {posters.map((item) => (
        <View key={item._id} style={styles.posterCard}>
          <Text style={styles.posterTitle}>{item.title}</Text>
          <Text style={styles.posterDate}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            onPress={() => confirmDelete(item._id)}
            style={styles.deleteBtn}
          >
            <Text style={styles.deleteText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9fafe',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a',
    textAlign: 'center',
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  uploadBtn: {
    marginTop: 10,
    backgroundColor: '#cbd5e1',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadText: {
    fontWeight: '600',
    color: '#1e3a8a',
  },
  previewImage: {
    marginTop: 10,
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#1e3a8a',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  posterCard: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#aaa',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  posterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  posterDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  deleteBtn: {
    marginTop: 10,
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});
