// components/ProfileHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, onpress } from 'react-native';

export default function ProfileHeader({ nameOrId, className, section }) {
  return (
   
    <TouchableOpacity onpress={onpress} activeOpacity={0.8}>
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {nameOrId ? nameOrId[0].toUpperCase() : '?'}
        </Text>
      </View>
      <View>
        <Text style={styles.name}>
          Hello, <Text style={{ fontWeight: 'bold' }}>{nameOrId || 'User'}</Text>
        </Text>
        {(className && section) && (
          <Text style={styles.subtext}>
            Class: {className} | Section: {section}
          </Text>
        )}
      </View>
    </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a4db7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: '#555',
    fontWeight: 'bold',
  },
  name: {
    color: 'white',
    fontSize: 18,
  },
  subtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
});
