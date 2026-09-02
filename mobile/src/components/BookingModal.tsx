import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing } from '../theme/theme';
import { ScheduleApi } from '../services/api';

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '11:45 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  provider: {
    id: string;
    name: string;
    type: 'veterinarian' | 'groomer' | 'dog_walker' | 'pet_sitter' | 'clinic';
  } | null;
  pets?: Array<{ _id: string; name: string; species: string; petId?: string }>;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onClose,
  provider,
  pets = [],
  onSuccess,
}) => {
  if (!provider) return null;

  const [selectedPet, setSelectedPet] = useState(pets[0] || { _id: 'general', name: 'My Pet', species: 'dog' });
  const [serviceName, setServiceName] = useState('Routine Checkup & Consultation');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBook = async () => {
    setIsSubmitting(true);
    try {
      await ScheduleApi.bookAppointment({
        petId: selectedPet._id,
        petPassportId: selectedPet.petId,
        petName: selectedPet.name,
        petSpecies: selectedPet.species,
        providerType: provider.type,
        providerId: provider.id,
        providerName: provider.name,
        serviceName,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        notes,
      });
      Alert.alert('✅ Appointment Confirmed', `Booked with ${provider.name} on ${selectedDate} at ${selectedSlot}. Added to your Pet Care Calendar!`);
      onSuccess?.();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>📅 Book Visit / Service</Text>
              <Text style={styles.headerSubtitle}>{provider.name} ({provider.type})</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll}>
            {pets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.label}>Select Pet</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
                  {pets.map((p) => (
                    <TouchableOpacity
                      key={p._id}
                      style={[styles.petChip, selectedPet._id === p._id && styles.chipActive]}
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
              <Text style={styles.label}>Reason / Service</Text>
              <TextInput
                style={styles.input}
                value={serviceName}
                onChangeText={setServiceName}
                placeholder="e.g. Annual Vaccination, Grooming, Walk"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="2026-09-04"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Select Time Slot</Text>
              <View style={styles.slotsGrid}>
                {TIME_SLOTS.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotChip, selectedSlot === slot && styles.slotActive]}
                    onPress={() => setSelectedSlot(slot)}
                  >
                    <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Care Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                multiline
                value={notes}
                onChangeText={setNotes}
                placeholder="Sensitivities, behavioral notes..."
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleBook} disabled={isSubmitting}>
              <Text style={styles.submitText}>{isSubmitting ? 'Booking...' : 'Confirm Visit'}</Text>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.primaryLight, marginTop: 2 },
  closeBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16 },
  closeText: { color: Colors.textMuted, fontSize: 14 },
  bodyScroll: { marginBottom: 12 },
  section: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
  horizontalRow: { flexDirection: 'row', gap: 8 },
  petChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8 },
  chipActive: { backgroundColor: '#0284c7' },
  chipText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 10, color: Colors.text, fontSize: 14 },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  slotActive: { backgroundColor: 'rgba(56,189,248,0.2)', borderColor: '#38bdf8' },
  slotText: { color: Colors.textMuted, fontSize: 12 },
  slotTextActive: { color: '#38bdf8', fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)' },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#0284c7' },
  submitText: { color: '#fff', fontWeight: '800' },
});
