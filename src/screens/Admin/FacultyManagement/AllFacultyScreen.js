// screens/Admin/AllFacultyScreen.js
import React, { useState, useCallback, useEffect } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TabView, TabBar } from 'react-native-tab-view';
import { api } from '../../../api/api';
import { useAdmin } from '../../../context/adminContext';

export default function AllFacultyScreen({ navigation }) {
  const { adminObjectId, adminLoading } = useAdmin();
  const layout = useWindowDimensions();

  const [activeTab, setActiveTab] = useState('active');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'active', title: 'Active' },
    { key: 'deleted', title: 'Deleted' },
    { key: 'createdByMe', title: 'Created By Me' },
  ]);

  useEffect(() => {
    setActiveTab(routes[index].key);
  }, [index]);

  const fetchFaculty = async (isRefresh = false) => {
    if (adminLoading) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let params = {};
      const currentTab = routes[index].key;

      if (currentTab === 'active') endpoint = '/api/admin/faculty';
      if (currentTab === 'deleted') endpoint = '/api/admin/faculty/deleted';
      if (currentTab === 'createdByMe') {
        endpoint = '/api/admin/faculty';
        params.adminId = adminObjectId;
      }

      const res = await api.get(endpoint, { params });
      let data = res.data?.data || res.data || [];

      if (currentTab !== 'deleted') {
        data = data.filter(f => f.deleted !== true);
      } else {
        data = data.filter(f => f.deleted === true);
      }

      setFacultyList(data);
    } catch (err) {
      console.error('Error fetching faculty:', err.response?.data || err.message);
      setError('Failed to load faculty data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFaculty();
    }, [index, adminObjectId, adminLoading])
  );

  const retryAllFailed = async () => {
    const failedUsers = facultyList.filter(
      f => f?.user?.accountProvisioning?.keycloakStatus === 'failed'
    );

    if (failedUsers.length === 0) {
      return Alert.alert('No Failed Users', 'There are no failed faculty to retry.');
    }

    await Promise.all(
      failedUsers.map(f =>
        api.post(`/api/admin/users/retry/${f.user._id}`)
      )
    );
    fetchFaculty();
  };

  const handleSoftDelete = userId => {
    Alert.alert('Soft Delete', 'Soft delete this faculty?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          await api.patch(`/api/admin/faculty/delete/${userId}`);
          fetchFaculty();
        },
      },
    ]);
  };

  const handleRestore = userId => {
    Alert.alert('Restore Faculty', 'Restore this faculty?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          await api.patch(`/api/admin/faculty/restore/${userId}`);
          fetchFaculty();
        },
      },
    ]);
  };

  const handleHardDelete = userId => {
    Alert.alert(
      'Permanent Delete',
      'This will permanently delete the faculty.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            await api.delete(`/api/admin/faculty/${userId}`);
            setFacultyList(prev => prev.filter(f => f.userId !== userId));
          },
        },
      ]
    );
  };

  const getCardStyle = status => {
    if (status === 'failed') return styles.failedCard;
    if (status === 'pending') return styles.pendingCard;
    if (status === 'success') return styles.successCard;
    return null;
  };

  const renderFacultyCard = fac => {
    const status =
      fac?.user?.accountProvisioning?.keycloakStatus ?? 'unknown';

    const currentTab = routes[index].key;
    let cardStyle = styles.facultyCard;
    if (currentTab === 'createdByMe') {
      cardStyle = [styles.facultyCard, getCardStyle(status)];
    } else if (currentTab === 'active') {
      cardStyle = [styles.facultyCard, styles.activeCard];
    } else if (currentTab === 'deleted') {
      cardStyle = [styles.facultyCard, styles.deletedCard];
    }

    return (
      <View key={fac._id} style={cardStyle}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('FacultyProfileViewScreen', {
              userId: fac.userId,
            })
          }
        >
          <Text style={styles.name}>
            {fac.name} ({fac.userId})
          </Text>

          {currentTab === 'createdByMe' && (
            <Text style={styles.status}>
              Status:{' '}
              <Text style={styles.statusText}>
                {status.toUpperCase()}
              </Text>
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.actionRow}>
          {(currentTab === 'active' || currentTab === 'createdByMe') && (
            <>
              <Text
                style={styles.editBtn}
                onPress={() =>
                  navigation.navigate('EditFacultyScreen', { faculty: fac })
                }
              >
                Edit
              </Text>
              <Text
                style={styles.softDeleteBtn}
                onPress={() => handleSoftDelete(fac.userId)}
              >
                Soft Delete
              </Text>
            </>
          )}

          {currentTab === 'deleted' && (
            <>
              <Text
                style={styles.restoreBtn}
                onPress={() => handleRestore(fac.userId)}
              >
                Restore
              </Text>
              <Text
                style={styles.hardDeleteBtn}
                onPress={() => handleHardDelete(fac.userId)}
              >
                Hard Delete
              </Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderScene = ({ route }) => {
    if (routes[index].key !== route.key) {
      return <View />;
    }

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchFaculty(true)}
          />
        }
        contentContainerStyle={styles.list}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#ac1d1d" style={{ marginTop: 30 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            {routes[index].key === 'createdByMe' && (
              <TouchableOpacity style={styles.retryAllBtn} onPress={retryAllFailed}>
                <Text style={styles.retryAllText}>Retry Failed Faculties</Text>
              </TouchableOpacity>
            )}
            {facultyList.length === 0 ? (
              <Text style={styles.empty}>No data found.</Text>
            ) : (
              facultyList.map(renderFacultyCard)
            )}
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={{ backgroundColor: '#ac1d1d' }}
            indicatorStyle={{ backgroundColor: 'white' }}
            labelStyle={{ fontWeight: 'bold' }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  retryAllBtn: {
    backgroundColor: '#ac1d1d',
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

  activeCard: {
    backgroundColor: '#fecaca',
  },

  deletedCard: {
    backgroundColor: '#c2c2c2',
  },

  name: { fontSize: 16, fontWeight: 'bold' },
  status: { marginTop: 6, fontWeight: 'bold' },
  statusText: { textTransform: 'uppercase' },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },

  editBtn: { color: '#0a7', fontWeight: 'bold', marginRight: 15 },
  softDeleteBtn: { color: '#c96f00', fontWeight: 'bold', marginRight: 15 },
  restoreBtn: { color: '#007aff', fontWeight: 'bold', marginRight: 15 },
  hardDeleteBtn: { color: '#dc2626', fontWeight: 'bold' },

  empty: { textAlign: 'center', color: '#666', marginTop: 30 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
});
