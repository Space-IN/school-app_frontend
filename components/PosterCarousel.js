// // component/PosterCarousel.js
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   StyleSheet,
//   useWindowDimensions,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
// } from 'react-native';
// import axios from 'axios';
// import { Ionicons } from '@expo/vector-icons';
// import BASE_URL from '../config/baseURL';

// export default function PosterCarousel() {
//   const { width } = useWindowDimensions();
//   const scrollRef = useRef(null);
//   const [posters, setPosters] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [expandedIndices, setExpandedIndices] = useState({});
//   const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

//   useEffect(() => {
//     const fetchPosters = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/posters/all`);
//         const validPosters = (res.data || []).reverse();
//         setPosters(validPosters);
//       } catch (err) {
//         console.error('❌ Error loading posters:', err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPosters();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (autoScrollEnabled && posters.length > 0) {
//         const next = (currentIndex + 1) % posters.length;
//         scrollToIndex(next);
//       }
//     }, 5000);

//     return () => clearInterval(interval);
//   }, [autoScrollEnabled, currentIndex, posters]);

//   const scrollToIndex = (index) => {
//     scrollRef.current?.scrollTo({ x: index * width, animated: true });
//     setCurrentIndex(index);
//   };

//   const toggleExpanded = (index) => {
//     setExpandedIndices((prev) => ({
//       ...prev,
//       [index]: !prev[index],
//     }));
//   };

//   if (loading) {
//     return (
//       <View style={{ alignItems: 'center', marginVertical: 20 }}>
//         <ActivityIndicator size="large" color="#2563eb" />
//       </View>
//     );
//   }

//   if (!posters.length) {
//     return (
//       <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
//         <Text style={{ color: '#999' }}>No posters available.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={{ marginBottom: 20 }}>
//       <Text style={styles.heading}>Latest Notices & Events</Text>

//       <View>
//         <ScrollView
//           ref={scrollRef}
//           horizontal
//           pagingEnabled
//           showsHorizontalScrollIndicator={false}
//           // scrollEventThrottle={16}
//           // onScroll={(e) => {
//           //   const index = Math.round(e.nativeEvent.contentOffset.x / width);
//           //   setCurrentIndex(index);
//           // }}
//           scrollEnabled={false}
//         >
//           {posters.map((poster, index) => {
//             const isExpanded = expandedIndices[index];
//             const isLong = poster.description?.length > 120;

//             return (
//               <TouchableWithoutFeedback
//                 key={index}
//                 onPressIn={() => setAutoScrollEnabled(false)}
//                 onPressOut={() => setAutoScrollEnabled(true)}
//               >
//                 <View style={[styles.slide, { width }]}>
//                   <Image
//                     source={
//                       poster.imageUrl
//                         ? { uri: poster.imageUrl }
//                         : require('../assets/placeholder.png')
//                     }
//                     style={styles.posterImage}
//                     resizeMode="cover"
//                   />

//                   <View style={styles.captionBox}>
//                     <Text
//                       style={styles.posterTitle}
//                       numberOfLines={1}
//                       ellipsizeMode="tail"
//                     >
//                       {poster.title}
//                     </Text>

//                     {!!poster.description?.trim() && (
//                       <>
//                         <Text
//                           style={styles.posterDescription}
//                           numberOfLines={isExpanded ? undefined : 3}
//                         >
//                           {poster.description}
//                         </Text>

//                         {isLong && (
//                           <TouchableOpacity onPress={() => toggleExpanded(index)}>
//                             <Text style={styles.moreButton}>
//                               {isExpanded ? 'Show Less' : 'Show More'}
//                             </Text>
//                           </TouchableOpacity>
//                         )}
//                       </>
//                     )}
//                   </View>
//                 </View>
//               </TouchableWithoutFeedback>
//             );
//           })}
//         </ScrollView>

//         {/* Navigation Buttons */}
//         <TouchableOpacity
//           style={[styles.navButton, { left: 10 }]}
//           onPress={() => {
//             const prev = (currentIndex - 1 + posters.length) % posters.length;
//             scrollToIndex(prev);
//           }}
//         >
//           <Ionicons name="chevron-back-circle" size={36} color="#2563eb" />
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.navButton, { right: 10 }]}
//           onPress={() => {
//             const next = (currentIndex + 1) % posters.length;
//             scrollToIndex(next);
//           }}
//         >
//           <Ionicons name="chevron-forward-circle" size={36} color="#2563eb" />
//         </TouchableOpacity>

//         {/* Dots */}
//         <View style={styles.dotsContainer}>
//           {posters.map((_, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.dot,
//                 { backgroundColor: index === currentIndex ? '#2563eb' : '#ccc' },
//               ]}
//             />
//           ))}
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   heading: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     marginVertical: 10,
//     paddingHorizontal: 12,
//   },
//   slide: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 10,
//   },
//   posterImage: {
//     width: '100%',
//     height: 200,
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//   },
//   captionBox: {
//     backgroundColor: '#e0f2fe',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     minHeight: 90,
//     justifyContent: 'center',
//     borderBottomLeftRadius: 10,
//     borderBottomRightRadius: 10,
//   },
//   posterTitle: {
//     fontWeight: '700',
//     fontSize: 16,
//     color: '#1e3a8a',
//     marginBottom: 4,
//   },
//   posterDescription: {
//     fontSize: 14,
//     color: '#334155',
//   },
//   moreButton: {
//     color: '#2563eb',
//     fontWeight: '500',
//     marginTop: 4,
//     fontSize: 14,
//   },
//   navButton: {
//     position: 'absolute',
//     top: '35%',
//     zIndex: 2,
//     backgroundColor: 'transparent',
//   },
//   dotsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 8,
//   },
//   dot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
// });

// component/PosterCarousel.js
// component/PosterCarousel.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const [expandedIndices, setExpandedIndices] = useState({});
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/posters/all`);
        const validPosters = (res.data || []).reverse();
        setPosters(validPosters);
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
      if (autoScrollEnabled && posters.length > 0) {
        const next = (currentIndex + 1) % posters.length;
        scrollToIndex(next);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [autoScrollEnabled, currentIndex, posters]);

  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentIndex(index);
  };

  const toggleExpanded = (index) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
      <Text style={styles.heading}>Latest Notices & Events</Text>

      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
        >
          {posters.map((poster, index) => {
            const isExpanded = expandedIndices[index];
            const isLong = poster.description?.length > 150;

            return (
              <TouchableWithoutFeedback
                key={index}
                onPressIn={() => setAutoScrollEnabled(false)}
                onPressOut={() => setAutoScrollEnabled(true)}
              >
                <View style={[styles.slide, { width }]}>
                  <Image
                    source={
                      poster.imageUrl
                        ? { uri: poster.imageUrl }
                        : require('../assets/placeholder.png')
                    }
                    style={styles.posterImage}
                    resizeMode="cover"
                  />

                  <View style={styles.captionBox}>
                    <Text style={styles.posterTitle}>
                      {poster.title}
                    </Text>

                    {!!poster.description?.trim() && (
                      <>
                        <Text
                          style={styles.posterDescription}
                          numberOfLines={isExpanded ? undefined : 3}
                        >
                          {poster.description}
                        </Text>

                        {isLong && (
                          <TouchableOpacity onPress={() => toggleExpanded(index)}>
                            <Text style={styles.moreButton}>
                              {isExpanded ? 'Show Less' : 'Show More'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            );
          })}
        </ScrollView>

        {/* Navigation Buttons */}
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

        {/* Dots */}
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
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  posterImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  captionBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  posterTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1e3a8a',
    marginBottom: 6,
  },
  posterDescription: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  moreButton: {
    color: '#2563eb',
    fontWeight: '500',
    marginTop: 6,
    fontSize: 14,
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
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
