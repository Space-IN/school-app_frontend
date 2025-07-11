import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import BASE_URL from '../config/baseURL';

export default function PosterCarousel() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/posters/all`);
        console.log('✅ Posters fetched:', res.data);

        // Remove .filter for debugging; filter can be added later
        const validPosters = (res.data || []).reverse();
        setPosters(validPosters);
        console.log('🎯 Valid Posters:', validPosters);
      } catch (err) {
        console.error('❌ Error loading posters:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosters();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (posters.length > 0) {
        const next = (currentIndex + 1) % posters.length;
        scrollToIndex(next);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, posters]);

  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!posters.length) {
    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        <Text style={{ color: '#999' }}>No posters available.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.heading}>📌 Latest Notices & Events</Text>

      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {posters.map((poster, index) => (
            <View key={index} style={{ width }}>
              <Image
                source={
                  poster.imageUrl
                    ? { uri: poster.imageUrl }
                    : require('../assets/placeholder.png') // optional fallback
                }
                style={{ width: width, height: width * 0.6 }}
                resizeMode="cover"
              />
              <View style={styles.captionBox}>
                <Text style={styles.posterTitle}>{poster.title}</Text>
                {!!poster.description?.trim() && (
                  <Text style={styles.posterDescription}>{poster.description}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.navButton, { left: 10 }]}
          onPress={() => {
            const prev = (currentIndex - 1 + posters.length) % posters.length;
            scrollToIndex(prev);
          }}
        >
          <Ionicons name="chevron-back-circle" size={36} color="#2563eb" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, { right: 10 }]}
          onPress={() => {
            const next = (currentIndex + 1) % posters.length;
            scrollToIndex(next);
          }}
        >
          <Ionicons name="chevron-forward-circle" size={36} color="#2563eb" />
        </TouchableOpacity>

        <View style={styles.dotsContainer}>
          {posters.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentIndex ? '#2563eb' : '#ccc' },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  captionBox: {
    backgroundColor: '#e0f2fe',
    padding: 10,
    paddingHorizontal: 16,
  },
  posterTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1e3a8a',
    marginBottom: 4,
  },
  posterDescription: {
    fontSize: 14,
    color: '#334155',
  },
  navButton: {
    position: 'absolute',
    top: '35%',
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
