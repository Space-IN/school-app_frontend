// school-app_frontend/screens/RoleSelection.js
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
import { LinearGradient } from 'expo-linear-gradient';

const imageFiles = [
  require('../assets/schoolbuilding.png'),
  require('../assets/class.png'),
  require('../assets/library.png'),
  require('../assets/sports.png'),
  require('../assets/computerlab.png'),
  require('../assets/Science.png'),
  // require('../assets/boarding.png'),
];

export default function RoleSelection({ navigation }) {
  const scrollRef = useRef(null);
  const currentIndexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  const handleSelectRole = (role) => {
    navigation.navigate('Login', { role });
  };

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
      source={require('../assets/schoolbackgroundd.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* 🏫 Logo + School Name */}
        <Image source={require('../assets/school.icon.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.schoolName}>
          VISHWACHETANA VIDYANIKETANA SCHOOL - DAVANGERE
        </Text>

        {/* 🔁 Image Slider (Poster Section) */}
        <View style={styles.sliderWrapper}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
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

        {/* 🧾 Welcome Texts */}
        <View style={styles.textBlock}>
          {/* <Text style={styles.welcomeText}>🎓 Welcome to Our School App</Text> */}
          <Text style={styles.roleText}>Choose Your Role to Continue</Text>
        </View>

        {/* 🧍 Glassmorphic Role Buttons */}
        <View style={styles.roleCard}>
          <TouchableOpacity onPress={() => handleSelectRole('Admin')}>
            <LinearGradient
              colors={['#9c1006', '#c71f0e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Admin</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSelectRole('Faculty')}>
            <LinearGradient
              colors={['#a61208', '#d62812']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Faculty</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleSelectRole('Student/Parent')}>
            <LinearGradient
              colors={['#b3150a', '#e6391a']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.button, { marginBottom: 10 }]}
            >
              <Text style={styles.buttonText}>Student / Parent</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  schoolName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9c1006',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
  },
  sliderWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderItem: {
    width: Dimensions.get('window').width,
    alignItems: 'center',
  },
  sliderImage: {
    width: '90%',
    height: Dimensions.get('window').width * 0.5,
    borderRadius: 16,
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
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  roleCard: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
