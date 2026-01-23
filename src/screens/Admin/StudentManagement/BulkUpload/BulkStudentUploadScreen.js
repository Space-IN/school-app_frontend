import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../../../../api/api';
import { BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';

const EDITABLE_FIELDS = [
  'name',
  'classname',
  'section',
  'rollno',
  'admissionnumber',
  'studentemail',
  'gender',
  'dob',
  'address',
  'admissiondate',
  'fathername',
  'fatheroccupation',
  'fathercontact',
  'mothername',
  'motheroccupation',
  'mothercontact',
  'parentemail',
  'board',
];

const normalizeRowKeys = (row) => {
  const normalized = {};
  Object.keys(row || {}).forEach((key) => {
    const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '');
    const val = row[key];
    normalized[cleanKey] =
      val === undefined || val === null ? '' : String(val).trim();
  });
  return normalized;
};

const BulkStudentUploadScreen = () => {
  const navigation = useNavigation(); 

  const [previewResult, setPreviewResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editedRows, setEditedRows] = useState({});

  const sortedPreviewData = useMemo(() => {
    if (!previewResult?.data) return [];

    const hasInvalid = previewResult.data.some(r => !r.isValid);
    if (!hasInvalid) return previewResult.data;

    return [...previewResult.data].sort((a, b) => {
      if (a.isValid === b.isValid) {
        return a.rowNumber - b.rowNumber;
      }
      return a.isValid ? 1 : -1;
    });
  }, [previewResult]);

  const canCommit =
    previewResult &&
    previewResult.totalRows > 0 &&
    previewResult.invalidCount === 0 &&
    !loading;

  const fieldHasError = (field) => {
    if (!editingRow?.errors) return false;
    return editingRow.errors.some(e =>
      e.toLowerCase().startsWith(`"${field}"`)
    );
  };

  const handlePickExcel = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
      ],
    });
    if (!result.canceled) uploadForPreview(result.assets[0]);
  };

  const uploadForPreview = async (file) => {
  try {
    setLoading(true);
    setEditedRows({});

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/vnd.ms-excel',
    });

    const res = await api.post(
      `/api/admin/students/import-batch/preview`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    const fixedData = res.data.data.map(r => ({
      ...r,
      originalData: normalizeRowKeys(r.data),
    }));

    setPreviewResult({ ...res.data, data: fixedData });
  } catch (err) {
    console.error('Preview upload failed:', err);

    if (!err.response) {
      Alert.alert(
        'Server Unreachable',
        'Unable to connect to the server. Please check if the server is running and try again.'
      );
    } else {
      Alert.alert(
        'Upload Failed',
        err.response?.data?.error || 'Failed to process the file.'
      );
    }
  } finally {
    setLoading(false);
  }
};


  const handleSaveEdit = () => {
    setEditedRows(prev => ({
      ...prev,
      [editingRow.rowNumber]: normalizeRowKeys(editForm),
    }));
    setEditingRow(null);
    setEditForm(null);
  };

  const handleReValidate = async () => {
    try {
      setLoading(true);

      const rows = previewResult.data.map(row => {
        const base = row.originalData;
        const edits = editedRows[row.rowNumber] || {};
        return {
          rowNumber: row.rowNumber,
          ...normalizeRowKeys({ ...base, ...edits }),
        };
      });

      const res = await api.post(
        `/api/admin/students/import-batch/preview`,
        { rows }
      );

      const fixedData = res.data.data.map((r, i) => ({
        ...r,
        originalData: rows[i],
      }));

      setPreviewResult({ ...res.data, data: fixedData });
      setEditedRows({});
    } catch (err) {
  console.error('Re-validation failed:', err);

  if (!err.response) {
    Alert.alert(
      'Server Unreachable',
      'Cannot re-validate because the server is not reachable.'
    );
  } else {
    Alert.alert(
      'Re-validation Failed',
      err.response?.data?.error || 'Please try again.'
    );
  }
} finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
  try {
    setLoading(true);

    const students = previewResult.data.map(r => {
      const d = r.originalData;
      return {
        ...d,
        userId: r.data?.userId || d.userid,
      };
    });

    const res = await api.post(
      `/api/admin/students/import-batch/commit`,
      { students }
    );

    console.log('COMMIT RESPONSE:', res.data);

    const batchId =
      res.data.importBatchId ||
      res.data.batchId ||
      res.data.batch?._id;

    if (res.data.inserted === 0) {
  Alert.alert(
    'No New Students Added',
    'All students in this file already exist. No new batch was created.'
   );
   return;
  }

  Alert.alert(
  'Students Added Successfully',
  `Inserted: ${res.data.inserted}\nSkipped: ${res.data.skipped?.length || 0}`,
  [
    {
      text: 'View Batch',
      onPress: () =>
        navigation.replace('BatchDetailsScreen', { batchId }),
    },
  ],
  { cancelable: false }
 );
  } catch (err) {
    console.error('Commit error:', err);

    if (!err.response) {
      Alert.alert(
        'Server Unreachable',
        'Students could not be added because the server is not reachable.'
      );
    } else {
      Alert.alert(
        'Commit Failed',
        err.response?.data?.error || 'Unable to add students'
      );
    }
  } finally {
    setLoading(false);
  }
};


  const renderRow = ({ item }) => {
    const data = {
      ...item.originalData,
      ...(editedRows[item.rowNumber] || {}),
    };

    const isEdited = !!editedRows[item.rowNumber];

    const visibleErrors = (item.errors || []).filter(err => {
      const field = err.match(/"(.+?)"/)?.[1];
      return !field || !(field in (editedRows[item.rowNumber] || {}));
    });

    return (
      <View
        style={[
          styles.rowCard,
          item.isValid
            ? styles.rowValid
            : isEdited
            ? styles.rowEdited
            : styles.rowInvalid,
        ]}
      >
        <Text style={styles.rowTitle}>Row {item.rowNumber}</Text>
        <Text>Name: {data.name}</Text>
        <Text>Class: {data.classname} | Section: {data.section}</Text>
        <Text>Admission: {data.admissionnumber}</Text>

        {item.isValid && item.data?.userId && (
          <Text style={styles.studentIdText}>
            Student ID: {item.data.userId}
          </Text>
        )}

        {visibleErrors.length > 0 && (
          <View style={styles.errorBox}>
            {visibleErrors.map((e, i) => (
              <Text key={i} style={styles.errorText}>• {e}</Text>
            ))}
          </View>
        )}

        {!item.isValid && (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => {
              setEditingRow(item);
              setEditForm({ ...data });
            }}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
      <View style={styles.loadingBox}>
        <Text style={styles.loadingText}>
          Processing, please wait...
        </Text>
      </View>
    )}

      <TouchableOpacity style={styles.uploadCard} onPress={handlePickExcel}>
        <Text style={styles.uploadTitle}>Add Bulk Students (Upload Excel)</Text>
      </TouchableOpacity>

      {previewResult && (
        <View style={styles.summaryStrip}>
          <Text>Total: {previewResult.totalRows}</Text>
          <Text>Valid: {previewResult.validCount}</Text>
          <Text>Invalid: {previewResult.invalidCount}</Text>
        </View>
      )}

      <FlatList
        data={sortedPreviewData}
        keyExtractor={i => String(i.rowNumber)}
        renderItem={renderRow}
      />

      {previewResult && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.revalidateBtn}
            onPress={handleReValidate}
            disabled={loading}
          >
            <Text style={styles.revalidateText}>Re-Validate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.commitBtn,
              !canCommit && styles.commitBtnDisabled,
            ]}
            disabled={!canCommit}
            onPress={handleCommit}
          >
            <Text
              style={[
                styles.commitText,
                !canCommit && styles.commitTextDisabled,
              ]}
            >
              Add Students
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* EDIT MODAL */}
      <Modal visible={!!editingRow} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.modalTopBar}>
            <TouchableOpacity onPress={() => setEditingRow(null)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Student</Text>
            <TouchableOpacity onPress={handleSaveEdit}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalDivider} />

          <ScrollView contentContainerStyle={styles.modalBody}>
            {EDITABLE_FIELDS.map(key => (
              <View key={key} style={{ marginBottom: 14 }}>
                <Text style={styles.label}>{key}</Text>
                <TextInput
                  value={editForm?.[key] ?? ''}
                  onChangeText={t =>
                    setEditForm(prev => ({ ...prev, [key]: t }))
                  }
                  style={[
                    styles.input,
                    fieldHasError(key) && styles.inputError,
                  ]}
                />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default BulkStudentUploadScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },

  uploadCard: {
    backgroundColor: '#a5150b',
    padding: 18,
    borderRadius: 12,
  },
  uploadTitle: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },

  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },

  rowCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  rowValid: { borderColor: '#16a34a' },
  rowInvalid: { borderColor: '#dc2626' },
  rowEdited: { borderColor: '#facc15' },

  rowTitle: { fontWeight: '600' },

  studentIdText: {
    marginTop: 4,
    fontWeight: '600',
    color: '#374151',
  },

  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  errorText: { color: '#b91c1c' },

  editBtn: { marginTop: 8, alignSelf: 'flex-end' },
  editBtnText: { color: '#1e3a8a', fontWeight: '600' },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },

  revalidateBtn: {
    flex: 1,
    backgroundColor: '#a5150b',
    padding: 14,
    borderRadius: 10,
  },
  revalidateText: { color: '#fff', textAlign: 'center', fontWeight: '600' },

  commitBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 10,
  },
  commitBtnDisabled: { backgroundColor: '#d1d5db' },
  commitText: { color: '#fff', textAlign: 'center', fontWeight: '700' },
  commitTextDisabled: { color: '#6b7280' },

  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalCancel: { color: '#6b7280' },
  modalSave: { color: '#1e3a8a', fontWeight: '700' },

  modalDivider: { height: 1, backgroundColor: '#e5e7eb' },
  modalBody: { padding: 16 },

  label: { fontSize: 13, color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 10,
    borderRadius: 8,
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fff5f5',
  },

  loadingBox: {
  paddingVertical: 12,
  alignItems: 'center',
  },
   loadingText: {
   color: '#374151',
   fontSize: 14,
  },

});
