import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing } from '../theme/theme';
import { PetProfileApi, ScheduleApi, CoParentApi } from '../services/api';
import { AddReminderModal } from '../components/AddReminderModal';

interface Pet {
  id: string;
  _id?: string;
  petId?: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  microchipId: string;
  rabiesTag?: string;
  allergies: string[];
  coParents?: Array<{ userId: string; name?: string; role: string }>;
  vaccines: Array<{ name: string; date: string; nextDue: string; status: 'valid' | 'due' }>;
  medicalHistory: Array<{ date: string; title: string; clinic: string; cost: number }>;
}

const INITIAL_PETS: Pet[] = [
  {
    id: 'pet_1',
    _id: 'pet_1',
    petId: 'PET-7492-A1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28.5,
    microchipId: '900215000492817',
    allergies: ['Chicken Protein'],
    vaccines: [
      { name: 'Rabies Booster', date: '2026-03-12', nextDue: '2027-03-12', status: 'valid' },
    ],
    medicalHistory: [
      { date: '2026-07-15', title: 'Routine Checkup & Deworming', clinic: 'Haifa Animal Hospital', cost: 240 },
    ],
  },
];

export const PassportScreen = () => {
  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [selectedPetId, setSelectedPetId] = useState<string>(INITIAL_PETS[0].id);
  const [activeSubTab, setActiveSubTab] = useState<'passport' | 'calendar'>('passport');
  const [petAppointments, setPetAppointments] = useState<any[]>([]);
  const [petReminders, setPetReminders] = useState<any[]>([]);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState('');

  const activePet = pets.find((p) => p.id === selectedPetId || p._id === selectedPetId) || pets[0];

  const fetchPetsAndSchedule = async () => {
    try {
      const serverPets = await PetProfileApi.getPets();
      if (serverPets?.length > 0) {
        const mapped = serverPets.map((p: any) => ({
          ...p,
          id: p._id || p.id,
        }));
        setPets(mapped);
      }
    } catch {}

    if (activePet?._id || activePet?.id) {
      const pId = activePet._id || activePet.id;
      try {
        const [appts, rems] = await Promise.all([
          ScheduleApi.getPetAppointments(pId),
          ScheduleApi.getPetReminders(pId),
        ]);
        setPetAppointments(appts || []);
        setPetReminders(rems || []);
      } catch {}
    }
  };

  useEffect(() => {
    fetchPetsAndSchedule();
  }, [selectedPetId]);

  const handleCopyTag = (tag: string) => {
    Alert.alert('📋 Tag Copied', `Pet Passport Tag ${tag} copied for lookups.`);
  };

  const handleToggleReminder = async (id: string) => {
    try {
      await ScheduleApi.toggleReminder(id);
      fetchPetsAndSchedule();
    } catch {}
  };

  const handleSendInvite = async () => {
    if (!inviteSearch.trim()) return;
    try {
      await CoParentApi.sendInvite(activePet._id || activePet.id, inviteSearch.trim());
      Alert.alert('✅ Invitation Sent', `Sent household co-parent invite to ${inviteSearch}. Expires in 24h.`);
      setShowInviteModal(false);
      setInviteSearch('');
    } catch {
      Alert.alert('Error', 'Could not send invitation.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pet Selector Tabs */}
      <View style={styles.petTabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
          {pets.map((pet) => {
            const isSelected = (pet.id || pet._id) === (activePet.id || activePet._id);
            return (
              <TouchableOpacity
                key={pet.id || pet._id}
                style={[styles.petTabPill, isSelected && styles.petTabPillActive]}
                onPress={() => setSelectedPetId(pet.id || pet._id || '')}
              >
                <Text style={styles.petTabEmoji}>{pet.species?.toLowerCase() === 'cat' ? '🐈' : '🐕'}</Text>
                <Text style={[styles.petTabText, isSelected && styles.petTabTextActive]}>{pet.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Passport Identity Card */}
      <View style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <View style={styles.petAvatar}>
            <Text style={{ fontSize: 32 }}>{activePet.species?.toLowerCase() === 'cat' ? '🐈' : '🐕'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.petName}>{activePet.name}</Text>
              <View style={styles.passportBadge}>
                <Text style={styles.passportBadgeText}>VERIFIED PASSPORT</Text>
              </View>
            </View>
            <Text style={styles.petBreed}>
              {activePet.breed} · {activePet.age} yrs · {activePet.weight} kg
            </Text>
          </View>
        </View>

        {/* Unique Pet ID & Microchip */}
        <View style={styles.idBox}>
          <View style={styles.idRow}>
            <View>
              <Text style={styles.idLabel}>UNIQUE PASSPORT TAG</Text>
              <Text style={[styles.idValue, { color: '#38bdf8', fontWeight: '900' }]}>
                {activePet.petId || 'PET-7492-A1'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => handleCopyTag(activePet.petId || 'PET-7492-A1')}
            >
              <Text style={styles.copyBtnText}>Copy Tag</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.idDivider} />

          <View style={styles.idRow}>
            <View>
              <Text style={styles.idLabel}>MICROCHIP ID</Text>
              <Text style={styles.idValue}>{activePet.microchipId || '900215000492817'}</Text>
            </View>
          </View>
        </View>

        {/* Co-Parents Row */}
        <View style={styles.coParentSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.coParentHeading}>👨‍👩‍👧 Household Co-Parents</Text>
            <TouchableOpacity onPress={() => setShowInviteModal(true)}>
              <Text style={styles.inviteLink}>+ Add Co-Parent</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.coParentSub}>
            Authorized family members who can access and manage this passport
          </Text>
        </View>
      </View>

      {/* Subtab Segmented Bar */}
      <View style={styles.subtabContainer}>
        <TouchableOpacity
          style={[styles.subtabBtn, activeSubTab === 'passport' && styles.subtabActive]}
          onPress={() => setActiveSubTab('passport')}
        >
          <Text style={[styles.subtabText, activeSubTab === 'passport' && styles.subtabTextActive]}>
            🏥 Medical History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subtabBtn, activeSubTab === 'calendar' && styles.subtabActive]}
          onPress={() => setActiveSubTab('calendar')}
        >
          <Text style={[styles.subtabText, activeSubTab === 'calendar' && styles.subtabTextActive]}>
            📅 Care Schedule & Reminders
          </Text>
        </TouchableOpacity>
      </View>

      {/* View Content */}
      {activeSubTab === 'calendar' ? (
        <View style={styles.calendarSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.sectionTitle}>Upcoming Care for {activePet.name}</Text>
            <TouchableOpacity style={styles.addReminderBtn} onPress={() => setShowAddReminder(true)}>
              <Text style={styles.addReminderText}>+ Add Task</Text>
            </TouchableOpacity>
          </View>

          {/* Visits */}
          {petAppointments.map((a) => (
            <View key={a._id} style={styles.scheduleCard}>
              <Text style={{ fontSize: 18 }}>🗓️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.scheduleTitle}>{a.serviceName}</Text>
                <Text style={styles.scheduleMeta}>With {a.providerName} ({a.providerType})</Text>
                <Text style={styles.scheduleDate}>{a.appointmentDate} at {a.timeSlot}</Text>
              </View>
            </View>
          ))}

          {/* Reminders */}
          {petReminders.map((r) => (
            <TouchableOpacity key={r._id} style={styles.scheduleCard} onPress={() => handleToggleReminder(r._id)}>
              <Text style={{ fontSize: 18 }}>{r.isCompleted ? '✅' : '🔔'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.scheduleTitle, r.isCompleted && styles.strike]}>{r.title}</Text>
                <Text style={styles.scheduleMeta}>Due: {r.dueDate} {r.dueTime ? `@ ${r.dueTime}` : ''} ({r.recurrence})</Text>
              </View>
            </TouchableOpacity>
          ))}

          {petAppointments.length === 0 && petReminders.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming visits or tasks for {activePet.name}.</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Clinical Records</Text>
          {(activePet.medicalHistory || []).map((rec, i) => (
            <View key={i} style={styles.historyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>{rec.title}</Text>
                <Text style={styles.historyClinic}>🏥 {rec.clinic}</Text>
                <Text style={styles.historyDate}>{rec.date}</Text>
              </View>
              <Text style={styles.historyCost}>₪{rec.cost}</Text>
            </View>
          ))}
        </View>
      )}

      <AddReminderModal
        visible={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        pets={pets.map((p) => ({ _id: p._id || p.id, name: p.name, species: p.species }))}
        onSuccess={fetchPetsAndSchedule}
      />

      {/* Co-Parent Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.inviteCard}>
            <Text style={styles.inviteTitle}>Invite Co-Parent for {activePet.name}</Text>
            <Text style={styles.inviteSub}>
              Enter user email or phone to grant access to {activePet.name}'s digital passport.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="User email or phone..."
              placeholderTextColor={Colors.textMuted}
              value={inviteSearch}
              onChangeText={setInviteSearch}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowInviteModal(false)}>
                <Text style={{ color: Colors.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendInvite}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Send Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40 },
  petTabsRow: { marginBottom: 14 },
  petTabPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8 },
  petTabPillActive: { backgroundColor: '#0284c7' },
  petTabEmoji: { fontSize: 16 },
  petTabText: { color: Colors.textMuted, fontSize: 13, fontWeight: '700' },
  petTabTextActive: { color: '#fff' },
  passportCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
  passportHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  petAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  petName: { fontSize: 20, fontWeight: '800', color: Colors.text },
  passportBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.15)', borderWidth: 1, borderColor: '#38bdf8' },
  passportBadgeText: { color: '#38bdf8', fontSize: 9, fontWeight: '800' },
  petBreed: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  idBox: { backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginBottom: 12 },
  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  idLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase' },
  idValue: { fontSize: 13, color: Colors.text, fontWeight: '700', marginTop: 2 },
  copyBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(56,189,248,0.15)', borderWidth: 1, borderColor: '#38bdf8' },
  copyBtnText: { color: '#38bdf8', fontSize: 11, fontWeight: '700' },
  idDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  coParentSection: { paddingTop: 6 },
  coParentHeading: { fontSize: 13, fontWeight: '700', color: Colors.text },
  inviteLink: { fontSize: 12, color: '#38bdf8', fontWeight: '700' },
  coParentSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  subtabContainer: { flexDirection: 'row', backgroundColor: 'rgba(15,23,42,0.6)', padding: 4, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
  subtabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  subtabActive: { backgroundColor: '#0284c7' },
  subtabText: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' },
  subtabTextActive: { color: '#fff' },
  calendarSection: { gap: 8 },
  recordsSection: { gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, textTransform: 'uppercase', marginBottom: 4 },
  addReminderBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(56,189,248,0.15)' },
  addReminderText: { color: '#38bdf8', fontSize: 12, fontWeight: '700' },
  scheduleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  scheduleTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  scheduleMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  scheduleDate: { fontSize: 11, color: '#38bdf8', marginTop: 2 },
  strike: { textDecorationLine: 'line-through', opacity: 0.5 },
  historyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: 'rgba(30,41,59,0.5)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  historyTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  historyClinic: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  historyDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  historyCost: { fontSize: 14, fontWeight: '800', color: '#10b981' },
  emptyCard: { padding: 20, alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: 14 },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: 20 },
  inviteCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inviteTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  inviteSub: { fontSize: 12, color: Colors.textMuted, marginBottom: 12 },
  input: { backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 10, color: Colors.text, fontSize: 14 },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  sendBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0284c7' },
});
