import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../theme/theme';
import { ScheduleApi } from '../services/api';
import { AddReminderModal } from './AddReminderModal';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  pets?: Array<{ _id: string; name: string; species: string }>;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  userId = 'all',
  pets = [],
}) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [selectedPetFilter, setSelectedPetFilter] = useState('all');
  const [showAddReminder, setShowAddReminder] = useState(false);

  const fetchSchedule = async () => {
    try {
      const [appts, rems] = await Promise.all([
        ScheduleApi.getUserAppointments(userId),
        ScheduleApi.getUserReminders(userId),
      ]);
      setAppointments(appts || []);
      setReminders(rems || []);
    } catch {}
  };

  useEffect(() => {
    if (visible) fetchSchedule();
  }, [visible]);

  const handleToggle = async (id: string) => {
    try {
      await ScheduleApi.toggleReminder(id);
      fetchSchedule();
    } catch {}
  };

  const handleCancelAppt = async (id: string) => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await ScheduleApi.cancelAppointment(id);
            fetchSchedule();
          } catch {}
        },
      },
    ]);
  };

  const filteredAppts = appointments.filter((a) => selectedPetFilter === 'all' || a.petId === selectedPetFilter);
  const filteredReminders = reminders.filter((r) => selectedPetFilter === 'all' || r.petId === selectedPetFilter);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>📅 Family Care Calendar</Text>
              <Text style={styles.headerSubtitle}>Multi-pet schedule synced with co-parents</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {pets.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendRow}>
              <TouchableOpacity
                style={[styles.legendPill, selectedPetFilter === 'all' && styles.legendActive]}
                onPress={() => setSelectedPetFilter('all')}
              >
                <View style={[styles.dot, { backgroundColor: '#38bdf8' }]} />
                <Text style={styles.legendText}>All Pets ({pets.length})</Text>
              </TouchableOpacity>
              {pets.map((p) => {
                const color = p.species === 'cat' ? '#0ea5e9' : p.species === 'bird' ? '#10b981' : '#f97316';
                const isActive = selectedPetFilter === p._id;
                return (
                  <TouchableOpacity
                    key={p._id}
                    style={[styles.legendPill, isActive && { borderColor: color, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                    onPress={() => setSelectedPetFilter(p._id)}
                  >
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={styles.legendText}>{p.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <ScrollView style={styles.listScroll}>
            {/* Appointments */}
            <Text style={styles.sectionHeader}>Confirmed Visits ({filteredAppts.length})</Text>
            {filteredAppts.map((a) => (
              <View key={a._id} style={[styles.card, { borderLeftColor: a.petColor || '#f97316' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{a.serviceName}</Text>
                  <Text style={styles.cardMeta}>🐾 {a.petName} · {a.providerName} ({a.providerType})</Text>
                  <Text style={styles.cardTime}>🗓️ {a.appointmentDate} at {a.timeSlot}</Text>
                </View>
                <TouchableOpacity onPress={() => handleCancelAppt(a._id)} style={styles.cancelAction}>
                  <Text style={styles.cancelActionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Reminders */}
            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>Care Tasks & Reminders ({filteredReminders.length})</Text>
            {filteredReminders.map((r) => (
              <TouchableOpacity key={r._id} style={[styles.card, { borderLeftColor: r.petColor || '#38bdf8' }]} onPress={() => handleToggle(r._id)}>
                <Text style={styles.checkIcon}>{r.isCompleted ? '✅' : '⚪'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, r.isCompleted && styles.strike]}>{r.title}</Text>
                  <Text style={styles.cardMeta}>🐾 {r.petName} · Due: {r.dueDate} {r.dueTime ? `@ ${r.dueTime}` : ''}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredAppts.length === 0 && filteredReminders.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No appointments or tasks scheduled.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddReminder(true)}>
              <Text style={styles.addBtnText}>➕ Add Care Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <AddReminderModal
        visible={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        pets={pets}
        onSuccess={fetchSchedule}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  headerSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  closeBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16 },
  closeText: { color: Colors.textMuted, fontSize: 14 },
  legendRow: { flexDirection: 'row', marginBottom: 12 },
  legendPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginRight: 8 },
  legendActive: { backgroundColor: 'rgba(56,189,248,0.15)', borderColor: '#38bdf8' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  listScroll: { marginBottom: 12 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 8 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderLeftWidth: 4, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  cardMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardTime: { fontSize: 11, color: '#38bdf8', marginTop: 3 },
  strike: { textDecorationLine: 'line-through', opacity: 0.5 },
  checkIcon: { fontSize: 16 },
  cancelAction: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  cancelActionText: { color: '#ef4444', fontSize: 11, fontWeight: '700' },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  footer: { paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  addBtn: { backgroundColor: '#0284c7', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
