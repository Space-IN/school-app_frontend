import React, { useEffect, useMemo, useState } from 'react';
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
  Modal,
} from 'react-native';
import { api } from '../../../../api/api';
import { BASE_URL } from '@env';

const getStudentStatus = (student) => {
  const ap = student.accountProvisioning;

  if (ap?.keycloakStatus === 'failed') return 'FAILED';
  if (ap?.keycloakStatus === 'success' && ap?.messageDeliveryStatus === 'failed')
    return 'FAILED';
  if (ap?.keycloakStatus === 'success') return 'SUCCESS';

  return 'PENDING';
};

const getFailureReason = (student) => {
  const ap = student.accountProvisioning;

  if (ap?.keycloakStatus === 'failed')
    return ap?.keycloakLastError || 'Account provisioning failed';

  if (ap?.keycloakStatus === 'success' && ap?.messageDeliveryStatus === 'failed')
    return 'Onboarding message delivery failed';

  return null;
};

const BatchDetailsScreen = ({ route }) => {
  const { batchId } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);

  const [classFilter, setClassFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [boardFilter, setBoardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [openFilter, setOpenFilter] = useState(null);

  const fetchBatchDetails = async () => {
    try {
      const res = await api.get(
        `${BASE_URL}/api/admin/students/import-batch/${batchId}`
      );
      setBatch(res.data.batch);
      setStudents(res.data.students || []);
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
        `${BASE_URL}/api/admin/students/import-batch/retry/${batchId}`
      );
      fetchBatchDetails();
    } catch {
      Alert.alert('Retry Failed', 'Unable to retry failed students');
    } finally {
      setRetrying(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const status = getStudentStatus(s);

        if (classFilter !== 'ALL' && s.className !== classFilter) return false;
        if (sectionFilter !== 'ALL' && s.section !== sectionFilter) return false;
        if (boardFilter !== 'ALL' && s.board !== boardFilter) return false;
        if (statusFilter !== 'ALL' && status !== statusFilter) return false;

        return true;
      })
      .sort((a, b) => {
        const order = { FAILED: 1, PENDING: 2, SUCCESS: 3 };
        return order[getStudentStatus(a)] - order[getStudentStatus(b)];
      });
  }, [students, classFilter, sectionFilter, boardFilter, statusFilter]);

  const renderStudent = ({ item }) => {
    const status = getStudentStatus(item);
    const reason = getFailureReason(item);

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
        <Text>ID: {item.userId}</Text>
        <Text>
          Class {item.className} | {item.section} | {item.board}
        </Text>
        <Text>Status: {status}</Text>
        {reason && <Text style={styles.errorText}>Reason: {reason}</Text>}
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

      <View style={styles.filterRow}>
        {[
          ['Class', classFilter],
          ['Section', sectionFilter],
          ['Board', boardFilter],
          ['Status', statusFilter],
        ].map(([label, value]) => (
          <TouchableOpacity
            key={label}
            style={styles.dropdown}
            onPress={() => setOpenFilter(label)}
          >
            <Text style={styles.dropdownText}>
              {label}: {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item._id}
        renderItem={renderStudent}
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
      />

      <Modal visible={!!openFilter} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setOpenFilter(null)}
          />
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select {openFilter}</Text>
            <FlatList
              data={
                openFilter === 'Class'
                  ? ['ALL', ...Array.from({ length: 12 }, (_, i) => String(i + 1))]
                  : openFilter === 'Section'
                  ? ['ALL', 'A', 'B', 'C']
                  : openFilter === 'Board'
                  ? ['ALL', 'CBSE', 'STATE']
                  : ['ALL', 'SUCCESS', 'PENDING', 'FAILED']
              }
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    if (openFilter === 'Class') setClassFilter(item);
                    if (openFilter === 'Section') setSectionFilter(item);
                    if (openFilter === 'Board') setBoardFilter(item);
                    if (openFilter === 'Status') setStatusFilter(item);
                    setOpenFilter(null);
                  }}
                >
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
  },

  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  statValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  successText: { color: '#16a34a' },
  failedText: { color: '#dc2626' },
  pendingText: { color: '#f59e0b' },

  retryInlineBtn: {
    alignSelf: 'center',
    marginBottom: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
  },
  retryBtnDisabled: { backgroundColor: '#fca5a5' },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  dropdown: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 3,
  },
  dropdownText: { fontSize: 13, fontWeight: '700', color: '#111827' },

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

  studentName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  errorText: { marginTop: 6, color: '#b91c1c', fontSize: 13 },

  emptyText: { textAlign: 'center', marginTop: 30, color: '#6b7280' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '80%',
    maxHeight: '65%',
    borderRadius: 12,
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
});
