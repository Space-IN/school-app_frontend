import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileHeader({ nameOrId, className, section, studentName }) {
  return (
    <View style={styles.header}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{nameOrId.charAt(0).toUpperCase()}</Text>
      </View>
      <View>
        <Text style={styles.name}>Hello, {nameOrId}</Text>
        {studentName ? (
          <Text style={styles.subInfo}>Student: {studentName} - {className} {section}</Text>
        ) : (
          className && section && (
            <Text style={styles.subInfo}>Class: {className} - Section: {section}</Text>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dfefff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: '#3399ff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  subInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
