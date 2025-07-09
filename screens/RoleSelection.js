import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  ScrollView,
  Dimensions,
} from 'react-native';

const imageFiles = [
  require('../assets/class.png'),
  require('../assets/library.png'),
  require('../assets/event.png'),
  require('../assets/computerlab.png'),
  require('../assets/sciencelab.png'),
  require('../assets/boarding.png'),
];

export default function RoleSelection({ navigation }) {
  const scrollRef = useRef(null);
  const currentIndexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  const handleSelectRole = (role) => {
    navigation.navigate('Login', { role });
  };

  // 🔁 Auto-scroll every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % imageFiles.length;
      scrollRef.current?.scrollTo({ x: nextIndex * screenWidth, animated: true });
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const onScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    currentIndexRef.current = slideIndex;
    setCurrentIndex(slideIndex);
  };

  return (
    <ImageBackground
      source={require('../assets/schoolbackground.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* 🔁 Image Slider */}
        <View style={styles.sliderWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: 0 }}
          >
            {imageFiles.map((img, index) => (
              <View key={index} style={styles.sliderItem}>
                <Image source={img} style={styles.sliderImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>

          <View style={styles.dotsContainer}>
            {imageFiles.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  { backgroundColor: currentIndex === index ? '#2563eb' : '#ccc' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* 🧾 Welcome and Role Texts */}
        <View style={styles.textBlock}>
          <Text style={styles.welcomeText}>Welcome to our School App</Text>
          <Text style={styles.roleText}>Register Based on Your School Role</Text>
        </View>

        {/* 🧍 Role Buttons */}
        <TouchableOpacity style={styles.button} onPress={() => handleSelectRole('Admin')}>
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.mediumButton]}
          onPress={() => handleSelectRole('Faculty')}
        >
          <Text style={styles.buttonText}>Faculty</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.smallButton, { marginBottom: 10 }]}
          onPress={() => handleSelectRole('Student/Parent')}
        >
          <Text style={styles.buttonText}>Student / Parent</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.88)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  sliderWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderItem: {
    width: Dimensions.get('window').width - 40,
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: Dimensions.get('window').width * 0.5,
    borderRadius: 12,
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
  textBlock: {
    alignItems: 'center',
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 6,
  },
  roleText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4682B4',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  mediumButton: {
    backgroundColor: '#4169E1',
  },
  smallButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
