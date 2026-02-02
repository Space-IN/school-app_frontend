import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { api } from '../../../../api/api';

const getStudentStatus = (student) => {
  const ap = student.accountProvisioning || {};
  const keycloakStatus =
    ap.keycloakStatus ||
    ap.status ||
    student.provisioningStatus ||
    'pending';

  if (keycloakStatus === 'failed') return 'FAILED';
  if (keycloakStatus === 'success') return 'SUCCESS';
  return 'PENDING';
};

const BatchDetailsScreen = ({ route }) => {
  const { batchId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);

  const fetchBatchDetails = async () => {
    try {
      const res = await api.get(
        `/api/admin/students/import-batch/${batchId}`
      );
      setBatch(res.data.batch);
      setStudents(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, []);

  useEffect(() => {
    if (!batch) return;
    if (batch.pending > 0 || batch.status === 'pending') {
      const i = setInterval(fetchBatchDetails, 5000);
      return () => clearInterval(i);
    }
  }, [batch?.pending, batch?.status]);

  const handleRetry = async () => {
    try {
      setRetrying(true);
      await api.post(
        `/api/admin/students/import-batch/retry/${batchId}`
      );
      fetchBatchDetails();
    } catch {
      Alert.alert('Retry Failed', 'Unable to retry failed students');
    } finally {
      setRetrying(false);
    }
  };

  const renderStudent = ({ item }) => {
    const status = getStudentStatus(item);
    return (
      <View
        style={[
          styles.studentCard,
          status === 'SUCCESS'
            ? styles.successBorder
            : status === 'FAILED'
            ? styles.failedBorder
            : styles.pendingBorder,
        ]}
      >
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.metaText}>ID: {item.userId}</Text>
        <Text style={styles.metaText}>
          Email: {item.email || 'N/A'}
        </Text>
        <Text
          style={[
            styles.statusText,
            status === 'SUCCESS'
              ? styles.successText
              : status === 'FAILED'
              ? styles.failedText
              : styles.pendingText,
          ]}
        >
          {status}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.batchCardCompact}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{batch.total}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Success</Text>
          <Text style={[styles.statValue, styles.successText]}>
            {batch.success}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Failed</Text>
          <Text style={[styles.statValue, styles.failedText]}>
            {batch.failed}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, styles.pendingText]}>
            {batch.pending}
          </Text>
        </View>
      </View>

      {batch.failed > 0 && batch.pending === 0 && (
        <TouchableOpacity
          style={[styles.retryInlineBtn, retrying && styles.retryBtnDisabled]}
          disabled={retrying}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>
            {retrying ? 'Retrying…' : 'Retry Failed Students'}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderStudent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchBatchDetails();
            }}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No students found</Text>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </SafeAreaView>
  );
};

export default BatchDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  batchCardCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fecaca',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },

  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#000000', fontWeight: '500' },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  successText: { color: '#16a34a' },
  failedText: { color: '#dc2626' },
  pendingText: { color: '#f59e0b' },

  retryInlineBtn: {
    alignSelf: 'center',
    marginBottom: 14,
    backgroundColor: '#dc2626',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryBtnDisabled: { backgroundColor: '#fca5a5' },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  studentCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  successBorder: { borderColor: '#16a34a' },
  failedBorder: { borderColor: '#dc2626' },
  pendingBorder: { borderColor: '#f59e0b' },

  studentName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  metaText: { fontSize: 13, color: '#4b5563' },
  statusText: { marginTop: 6, fontSize: 13, fontWeight: '700' },

  emptyText: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
});
