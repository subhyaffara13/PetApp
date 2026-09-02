import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../theme/theme';
import { ScheduleApi } from '../services/api';

interface AddReminderModalProps {
  visible: boolean;
  onClose: () => void;
  pets?: Array<{ _id: string; name: string; species: string }>;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: 'food', label: '🍖 Food Refill' },
  { id: 'vaccine', label: '💉 Vaccine Booster' },
  { id: 'medication', label: '💊 Medication' },
  { id: 'grooming', label: '✂️ Grooming' },
  { id: 'walking', label: '🐕 Dog Walk' },
  { id: 'custom', label: '🔔 Custom Task' },
];

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  visible,
  onClose,
  pets = [],
  onSuccess,
}) => {
  const [selectedPet, setSelectedPet] = useState(pets[0] || { _id: 'general', name: 'My Pet', species: 'dog' });
  const [title, setTitle] = useState('');
  const [type, setType] = useState('food');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('09:00 AM');
  const [recurrence, setRecurrence] = useState('monthly');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return Alert.alert('Required', 'Please enter reminder title.');
    setIsSubmitting(true);
    try {
      await ScheduleApi.createReminder({
        petId: selectedPet._id,
        petName: selectedPet.name,
        title: title.trim(),
        type,
        dueDate,
        dueTime,
        recurrence,
        notes,
      });
      Alert.alert('✅ Saved', 'Care reminder created successfully!');
      onSuccess?.();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to save reminder.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>➕ Add Care Reminder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginBottom: 12 }}>
            {pets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.label}>Select Pet</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {pets.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.chip, selectedPet._id === p._id && styles.chipActive]}
                      onPress={() => setSelectedPet(p)}
                    >
                      <Text style={[styles.chipText, selectedPet._id === p._id && styles.chipTextActive]}>
                        🐾 {p.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Reminder Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Buy Salmon Kibble 15kg, Heartgard..."
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, type === c.id && styles.chipActive]}
                    onPress={() => setType(c.id)}
                  >
                    <Text style={[styles.chipText, type === c.id && styles.chipTextActive]}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[styles.section, { flex: 1.2 }]}>
                <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} />
              </View>
              <View style={[styles.section, { flex: 0.8 }]}>
                <Text style={styles.label}>Due Time</Text>
                <TextInput style={styles.input} value={dueTime} onChangeText={setDueTime} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Repeat / Recurrence</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['once', 'weekly', 'monthly', 'yearly'].map((rec) => (
                  <TouchableOpacity
                    key={rec}
                    style={[styles.chip, recurrence === rec && styles.chipActive]}
                    onPress={() => setRecurrence(rec)}
                  >
                    <Text style={[styles.chipText, recurrence === rec && styles.chipTextActive]}>
                      {rec.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 50 }]}
                multiline
                value={notes}
                onChangeText={setNotes}
                placeholder="Dosage or special brand..."
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} disabled={isSubmitting}>
              <Text style={styles.submitText}>{isSubmitting ? 'Saving...' : 'Save Reminder'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.text },
  closeBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16 },
  closeText: { color: Colors.textMuted, fontSize: 14 },
  section: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', marginRight: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  chipText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 8, color: Colors.text, fontSize: 13 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0284c7' },
  submitText: { color: '#fff', fontWeight: '800' },
});
