import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const defaultScreenOptions = {
  headerStyle: {
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitleStyle: {
    color: '#1e3a8a',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTintColor: '#1e3a8a',
  headerBackTitleVisible: false,
  headerBackImage: ({ tintColor }) => (
    <Ionicons 
      name="arrow-back" 
      size={24} 
      color={tintColor} 
      style={{ marginLeft: Platform.OS === 'ios' ? 8 : 0 }}
    />
  ),
};