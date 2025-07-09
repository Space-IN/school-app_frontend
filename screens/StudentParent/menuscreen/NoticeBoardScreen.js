import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function NoticeBoardScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/noticeboard.png')} 
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.message}>
        Looks like the noticeboard is empty :
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 20,
    opacity: 0.9,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
});
