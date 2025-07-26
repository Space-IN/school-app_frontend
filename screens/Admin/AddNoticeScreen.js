import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { io } from "socket.io-client";

const AddNoticeScreen = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [specificIds, setSpecificIds] = useState("");

  const socket = io("http://10.221.34.141:5000");


  const handleAddNotice = async () => {
    if (!title || !message) {
      Alert.alert("Error", "Title and message are required");
      return;
    }

    try {

      await axios.post("http://10.221.34.141:5000/api/notices/add", {


        title,
        message,
        target,
        specificIds: target === "specific" ? specificIds.split(",") : [],
      });

      socket.emit("new_notice", {
        title,
        message,
        target,
        specificIds: target === "specific" ? specificIds.split(",") : [],
      });

      Alert.alert("Success", "Notice added successfully");
      setTitle("");
      setMessage("");
      setTarget("all");
      setSpecificIds("");
    } catch (error) {
      console.error("Error adding notice:", error);
      Alert.alert("Error", "Failed to add notice");
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

      {["all", "students", "faculty", "specific"].map((option) => (
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

      <TouchableOpacity style={styles.button} onPress={handleAddNotice}>
        <Text style={styles.buttonText}>Add Notice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddNoticeScreen;

const styles = StyleSheet.create({
  container: { padding: 30 },
  heading: { fontSize: 24, marginBottom: 15, fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
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

});

});



