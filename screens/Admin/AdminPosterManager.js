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

  // Request permission for media library
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow media access in settings');
      }
    })();
  }, []);

  const handleChange = (field, value) => {
    setPoster({ ...poster, [field]: value });
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker?.MediaType?.IMAGE || ImagePicker .MediaTypeOptions.Images, // ✅ use updated constant
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
      const res = await axios.post(`${BASE_URL}/api/posters/add-poster`, poster);
      Alert.alert('✅ Success', res.data.message);
      setPoster({ type: 'academic', title: '', description: '', imageUrl: '' });
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
});
