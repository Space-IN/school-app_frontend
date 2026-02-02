import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { api } from '../../../api/api'
import { BASE_URL } from '@env'
import { useAdmin } from '../../../context/adminContext'

const StudentEntryHubScreen = ({ navigation }) => {
  const { adminUserId, adminLoading } = useAdmin()

  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBatches = async () => {
    if (!adminUserId) return

    try {
      setLoading(true)
      console.log(" adminUserId used:", adminUserId)

      const res = await api.get(
        `/api/admin/students/import-batch/admin/${adminUserId}`,
      )

      setBatches(res.data?.data || [])
    } catch (err) {
      console.error('Failed to fetch batches:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminLoading && adminUserId) {
      fetchBatches()
    }
  }, [adminLoading, adminUserId])

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusStyle = (batch) => {
    if (batch.pending > 0) return styles.statusPending
    if (batch.failed > 0) return styles.statusFailed
    return styles.statusSuccess
  }

  const getStatusText = (batch) => {
    if (batch.pending > 0) return 'Pending'
    if (batch.failed > 0) return 'Failed'
    return 'Completed'
  }

  const renderBatch = ({ item }) => (
    <TouchableOpacity
      style={styles.batchCard}
      onPress={() =>
        navigation.navigate('BatchDetailsScreen', {
          batchId: item._id,
        })
      }
    >
      <View style={styles.batchHeader}>
        <Text style={styles.batchDate}>
          {formatDate(item.createdAt)}
        </Text>

        <View style={[styles.statusBadge, getStatusStyle(item)]}>
          <Text style={styles.statusText}>
            {getStatusText(item)}
          </Text>
        </View>
      </View>

      <View style={styles.batchStats}>
        <Text style={styles.statText}>Total: {item.total}</Text>
        <Text style={styles.statText}>Success: {item.success}</Text>
        <Text style={styles.statText}>Failed: {item.failed}</Text>
        <Text style={styles.statText}>Pending: {item.pending}</Text>
      </View>
    </TouchableOpacity>
  )

  if (adminLoading || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.primaryCard}
        onPress={() =>
          navigation.navigate('BoardSelectionScreen', {
            nextScreen: 'AddStudentScreen',
            title: 'Add Student - Select Board',
          })
        }
      >
        <Text style={styles.primaryText}>Add Student Manually</Text>
        <Text style={styles.subText}>
          Add a single student using the form
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryCard}
        onPress={() => navigation.navigate('BulkStudentUploadScreen')}
      >
        <Text style={styles.primaryText}>Bulk Upload Students</Text>
        <Text style={styles.subText}>
          Upload Excel and add students in bulk
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Upload Batches</Text>

      {batches.length === 0 ? (
        <Text style={styles.emptyText}>No batches created yet.</Text>
      ) : (
        <FlatList
          data={batches}
          keyExtractor={(item) => item._id}
          renderItem={renderBatch}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  )
}

export default StudentEntryHubScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    padding: 16,
  },

  primaryCard: {
    backgroundColor: '#9c1006',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
  },

  secondaryCard: {
    backgroundColor: '#9c1006',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },

  primaryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },

  subText: {
    color: '#ffffff',
    marginTop: 6,
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },

  batchCard: {
    backgroundColor: '#fecaca',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  batchDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#030303',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  statusSuccess: { backgroundColor: '#16a34a' },
  statusFailed: { backgroundColor: '#dc2626' },
  statusPending: { backgroundColor: '#f59e0b' },

  batchStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statText: {
    fontSize: 13,
    color: '#374151',
  },

  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
  },
})
