// screens/Admin/AllFacultyScreen.js
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../../../api/api';
import { useAdmin } from '../../../context/adminContext';

export default function AllFacultyScreen({ navigation }) {
  const { adminObjectId, adminLoading } = useAdmin();

  const [activeTab, setActiveTab] = useState('active');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');


  const fetchFaculty = async (isRefresh = false) => {
    if (adminLoading) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let params = {};

      if (activeTab === 'active') {
        endpoint = '/api/admin/faculty';
      }

      if (activeTab === 'deleted') {
        endpoint = '/api/admin/faculty/deleted';
      }

      if (activeTab === 'createdByMe') {
        if (!adminObjectId) {
          throw new Error('Admin ObjectId missing');
        }
        endpoint = '/api/admin/faculty';
        params.adminId = adminObjectId;
      }

      const res = await api.get(endpoint, { params });
      const data = res.data?.data || [];


      const sorted = data.sort((a, b) => {
        const order = { failed: 0, pending: 1, success: 2, active: 2 };
        const s1 = a?.user?.accountProvisioning?.keycloakStatus || 'success';
        const s2 = b?.user?.accountProvisioning?.keycloakStatus || 'success';
        return (order[s1] ?? 3) - (order[s2] ?? 3);
      });

      setFacultyList(sorted);
    } catch (err) {
      console.error(' Error fetching faculty:', err.response?.data || err.message || err);
      setError('Failed to load faculty data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFaculty();
    }, [activeTab, adminObjectId, adminLoading])
  );


  const retryAllFailed = async () => {
    const failedUsers = facultyList.filter(
      f => f?.user?.accountProvisioning?.keycloakStatus === 'failed'
    );

    if (failedUsers.length === 0) {
      return Alert.alert('No Failed Users', 'There are no failed faculty to retry.');
    }

    try {
      await Promise.all(
        failedUsers.map(f =>
          api.post(`/api/admin/users/retry/${f.user._id}`)
        )
      );

      Alert.alert('Retry Started', 'Retry triggered for failed faculties.');
      fetchFaculty();
    } catch (err) {
      console.error('❌ Retry error:', err.response?.data || err);
      Alert.alert('Error', 'Failed to retry some users.');
    }
  };


  const getCardStyle = status => {
    if (status === 'failed') return styles.failedCard;
    if (status === 'pending') return styles.pendingCard;
    return styles.successCard;
  };

  const renderFacultyCard = fac => {
    const status = fac?.user?.accountProvisioning?.keycloakStatus || 'success';

    return (
      <TouchableOpacity
        key={fac._id}
        style={[styles.facultyCard, getCardStyle(status)]}
        onPress={() =>
          navigation.navigate('FacultyProfileViewScreen', {
            userId: fac.userId,
          })
        }
      >
        <Text style={styles.name}>
          {fac.name} ({fac.userId})
        </Text>

        <Text style={styles.status}>
          Status:{' '}
          <Text style={styles.statusText}>
            {status.toUpperCase()}
          </Text>
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.tabRow}>
        {['active', 'deleted', 'createdByMe'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={styles.tabText}>
              {tab === 'createdByMe' ? 'Created By Me' : tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>


      {activeTab === 'createdByMe' && (
        <TouchableOpacity style={styles.retryAllBtn} onPress={retryAllFailed}>
          <Text style={styles.retryAllText}>Retry Failed Faculties</Text>
        </TouchableOpacity>
      )}


      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 30 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchFaculty(true)} />
          }
          contentContainerStyle={styles.list}
        >
          {facultyList.length === 0 ? (
            <Text style={styles.empty}>No data found.</Text>
          ) : (
            facultyList.map(renderFacultyCard)
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ec7f7f',
    paddingVertical: 10,
  },
  tabBtn: { padding: 8, borderRadius: 20 },
  activeTab: { backgroundColor: '#bbdbfa' },
  tabText: { fontWeight: 'bold' },

  retryAllBtn: {
    backgroundColor: '#007aff',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryAllText: { color: '#fff', fontWeight: 'bold' },

  list: { padding: 16 },
  facultyCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  failedCard: { backgroundColor: '#ffd6d6' },
  pendingCard: { backgroundColor: '#fff3cd' },
  successCard: { backgroundColor: '#d4edda' },

  name: { fontSize: 16, fontWeight: 'bold' },
  status: { marginTop: 6, fontWeight: 'bold' },
  statusText: { textTransform: 'uppercase' },

  empty: { textAlign: 'center', color: '#666', marginTop: 30 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
});
