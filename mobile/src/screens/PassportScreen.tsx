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
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { PetProfileApi } from '../services/api';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  microchipId: string;
  rabiesTag: string;
  allergies: string[];
  vaccines: Array<{ name: string; date: string; nextDue: string; status: 'valid' | 'due' }>;
  medicalHistory: Array<{ date: string; title: string; clinic: string; cost: number }>;
}

const INITIAL_PETS: Pet[] = [
  {
    id: 'pet_1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 28.5,
    microchipId: '900215000492817',
    rabiesTag: 'ISR-2026-8819',
    allergies: ['Chicken Protein', 'Penicillin'],
    vaccines: [
      { name: 'Rabies (כלבת)', date: '2026-03-12', nextDue: '2027-03-12', status: 'valid' },
      { name: 'DHPP Core 6-in-1 (משושה)', date: '2026-02-10', nextDue: '2027-02-10', status: 'valid' },
      { name: 'Bordetella (שעלת המכלאות)', date: '2025-09-01', nextDue: '2026-09-01', status: 'due' },
    ],
    medicalHistory: [
      { date: '2026-07-15', title: 'Routine Checkup & Deworming', clinic: 'Haifa Animal Hospital', cost: 240 },
      { date: '2026-03-12', title: 'Annual Rabies Vaccination', clinic: 'Carmel Pet Care', cost: 160 },
    ],
  },
  {
    id: 'pet_2',
    name: 'Luna',
    species: 'Cat',
    breed: 'British Shorthair',
    age: 2,
    weight: 4.2,
    microchipId: '900215000881923',
    rabiesTag: 'ISR-2026-9921',
    allergies: ['Dust Mites'],
    vaccines: [
      { name: 'FVRCP Tri-Cat (מרובעת)', date: '2026-01-20', nextDue: '2027-01-20', status: 'valid' },
      { name: 'Rabies (כלבת)', date: '2026-01-20', nextDue: '2027-01-20', status: 'valid' },
    ],
    medicalHistory: [
      { date: '2026-01-20', title: 'Spay & Microchip Verification', clinic: 'Haifa Animal Hospital', cost: 650 },
    ],
  },
];

export const PassportScreen = () => {
  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [selectedPetId, setSelectedPetId] = useState<string>(INITIAL_PETS[0].id);

  // Add Pet Modal
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newSpecies, setNewSpecies] = useState('Dog');
  const [newBreed, setNewBreed] = useState('');
  const [newMicrochip, setNewMicrochip] = useState('');

  // Scan Receipt Modal
  const [showScanModal, setShowScanModal] = useState(false);
  const [receiptText, setReceiptText] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const activePet = pets.find((p) => p.id === selectedPetId) || pets[0];

  const handleAddPet = () => {
    if (!newPetName.trim()) return;
    const newPet: Pet = {
      id: `pet_${Date.now()}`,
      name: newPetName.trim(),
      species: newSpecies,
      breed: newBreed.trim() || 'Mixed',
      age: 1,
      weight: 10,
      microchipId: newMicrochip.trim() || `900215000${Math.floor(100000 + Math.random() * 900000)}`,
      rabiesTag: `ISR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      allergies: [],
      vaccines: [
        { name: 'Rabies (כלבת)', date: '2026-05-01', nextDue: '2027-05-01', status: 'valid' },
      ],
      medicalHistory: [],
    };
    setPets([...pets, newPet]);
    setSelectedPetId(newPet.id);
    setShowAddPet(false);
    setNewPetName('');
    setNewBreed('');
    setNewMicrochip('');
    Alert.alert('🐾 Pet Added!', `${newPet.name}'s digital passport has been created.`);
  };

  const handleSimulateScanReceipt = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const parsedRecord = {
        date: new Date().toISOString().split('T')[0],
        title: 'Emergency Trauma Triage & Antibiotics (Receipt Scan)',
        clinic: 'Haifa 24/7 ER Clinic',
        cost: 380,
      };
      const updatedPets = pets.map((p) => {
        if (p.id === activePet.id) {
          return {
            ...p,
            medicalHistory: [parsedRecord, ...p.medicalHistory],
          };
        }
        return p;
      });
      setPets(updatedPets);
      setShowScanModal(false);
      Alert.alert(
        '🧾 Receipt Scanned & EMR Updated!',
        `Logged ₪380 treatment at Haifa 24/7 ER Clinic into ${activePet.name}'s passport.`
      );
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pet Selector Tabs */}
      <View style={styles.petTabsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.xs }}>
          {pets.map((pet) => {
            const isSelected = pet.id === activePet.id;
            return (
              <TouchableOpacity
                key={pet.id}
                style={[styles.petTabPill, isSelected && styles.petTabPillActive]}
                onPress={() => setSelectedPetId(pet.id)}
              >
                <Text style={styles.petTabEmoji}>{pet.species === 'Cat' ? '🐈' : '🐕'}</Text>
                <Text style={[styles.petTabText, isSelected && styles.petTabTextActive]}>{pet.name}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.addPetPill} onPress={() => setShowAddPet(true)}>
            <Text style={styles.addPetText}>+ Add Pet</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Passport Card */}
      <View style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <View style={styles.petAvatar}>
            <Text style={{ fontSize: 32 }}>{activePet.species === 'Cat' ? '🐈' : '🐕'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.petName}>{activePet.name}</Text>
              <View style={styles.passportBadge}>
                <Text style={styles.passportBadgeText}>PASSPORT VERIFIED</Text>
              </View>
            </View>
            <Text style={styles.petBreed}>
              {activePet.breed} · {activePet.age} yrs · {activePet.weight} kg
            </Text>
          </View>
        </View>

        {/* Microchip & IDs */}
        <View style={styles.idBox}>
          <View style={styles.idRow}>
            <Text style={styles.idLabel}>MICROCHIP ID</Text>
            <Text style={styles.idValue}>{activePet.microchipId}</Text>
          </View>
          <View style={styles.idDivider} />
          <View style={styles.idRow}>
            <Text style={styles.idLabel}>RABIES TAG</Text>
            <Text style={styles.idValue}>{activePet.rabiesTag}</Text>
          </View>
        </View>

        {/* Allergies Warning */}
        {activePet.allergies.length > 0 && (
          <View style={styles.allergyBox}>
            <Text style={styles.allergyTitle}>⚠️ CRITICAL MEDICAL ALLERGIES:</Text>
            <Text style={styles.allergyText}>{activePet.allergies.join(' · ')}</Text>
          </View>
        )}
      </View>

      {/* Scan Receipt / EMR Button */}
      <TouchableOpacity style={styles.btnScanReceipt} onPress={() => setShowScanModal(true)}>
        <Text style={styles.btnScanText}>🧾 Scan Clinic Receipt / Add EMR Record</Text>
      </TouchableOpacity>

      {/* Vaccine Timeline */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>💉 Vaccine & Preventive Care</Text>
        {activePet.vaccines.map((v, idx) => (
          <View key={idx} style={styles.vaccineRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.vaccineName}>{v.name}</Text>
              <Text style={styles.vaccineSub}>Administered: {v.date} · Next Due: {v.nextDue}</Text>
            </View>
            <View style={[styles.vaxStatusBadge, v.status === 'valid' ? styles.vaxValid : styles.vaxDue]}>
              <Text style={styles.vaxStatusText}>{v.status === 'valid' ? 'VALID' : 'RENEWAL DUE'}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Medical History Log */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>📋 Medical Treatment Log</Text>
        {activePet.medicalHistory.length === 0 ? (
          <Text style={styles.emptyHistory}>No medical records yet. Tap Scan Receipt above to add.</Text>
        ) : (
          activePet.medicalHistory.map((item, idx) => (
            <View key={idx} style={styles.historyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>{item.title}</Text>
                <Text style={styles.historySub}>🏥 {item.clinic} · {item.date}</Text>
              </View>
              <Text style={styles.historyCost}>₪{item.cost}</Text>
            </View>
          ))
        )}
      </View>

      {/* Add Pet Modal */}
      <Modal visible={showAddPet} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalHeading}>🐾 Register New Pet Passport</Text>
            <Text style={styles.inputLabel}>Pet Name</Text>
            <TextInput
              style={styles.textInput}
              value={newPetName}
              onChangeText={setNewPetName}
              placeholder="e.g. Milo"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Species</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: 8 }}>
              {['Dog', 'Cat', 'Bird', 'Rabbit'].map((sp) => (
                <TouchableOpacity
                  key={sp}
                  style={[styles.speciesPill, newSpecies === sp && styles.speciesPillActive]}
                  onPress={() => setNewSpecies(sp)}
                >
                  <Text style={[styles.speciesText, newSpecies === sp && { color: Colors.primaryLight }]}>{sp}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Breed</Text>
            <TextInput
              style={styles.textInput}
              value={newBreed}
              onChangeText={setNewBreed}
              placeholder="e.g. Beagle / Mixed"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Microchip ID (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={newMicrochip}
              onChangeText={setNewMicrochip}
              placeholder="15-digit ISO microchip"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setShowAddPet(false)}>
                <Text style={{ color: Colors.textMuted, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnConfirm} onPress={handleAddPet}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Save Passport</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Scan Receipt Modal */}
      <Modal visible={showScanModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalHeading}>🧾 Scan Clinic Receipt / Invoice</Text>
            <Text style={styles.modalSub}>
              Take a photo or paste OCR text from your veterinary receipt to automatically log vaccines and treatments.
            </Text>

            <View style={styles.cameraBox}>
              <Text style={{ fontSize: 36 }}>📸</Text>
              <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                Simulate Camera Capture / OCR
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.btnScanConfirm, isScanning && { opacity: 0.7 }]}
              onPress={handleSimulateScanReceipt}
              disabled={isScanning}
            >
              {isScanning ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnScanConfirmText}>⚡ Parse Receipt & Allocate to {activePet.name}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={() => setShowScanModal(false)}>
              <Text style={{ color: Colors.textMuted, fontWeight: '700', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 32 },
  petTabsRow: { marginBottom: Spacing.md },
  petTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  petTabPillActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primaryLight,
  },
  petTabEmoji: { fontSize: 15 },
  petTabText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  petTabTextActive: { color: Colors.primaryLight, fontWeight: '800' },
  addPetPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPetText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '700' },
  passportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  passportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  petAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  petName: { fontSize: 19, fontWeight: '900', color: Colors.text },
  passportBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passportBadgeText: { color: Colors.successLight, fontSize: 9, fontWeight: '900' },
  petBreed: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  idBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    padding: 10,
    marginBottom: Spacing.sm,
  },
  idRow: { flex: 1, alignItems: 'center' },
  idDivider: { width: 1, backgroundColor: Colors.border, marginHorizontal: 8 },
  idLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '700' },
  idValue: { fontSize: 11, color: Colors.text, fontWeight: '800', fontFamily: 'monospace', marginTop: 2 },
  allergyBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  allergyTitle: { fontSize: 10, fontWeight: '900', color: Colors.dangerLight },
  allergyText: { fontSize: 11, color: '#fff', fontWeight: '700', marginTop: 2 },
  btnScanReceipt: {
    backgroundColor: Colors.surfaceCard,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginBottom: Spacing.md,
  },
  btnScanText: { color: Colors.primaryLight, fontSize: 12, fontWeight: '800' },
  sectionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: Spacing.sm },
  vaccineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  vaccineName: { fontSize: 13, fontWeight: '700', color: Colors.text },
  vaccineSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  vaxStatusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  vaxValid: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  vaxDue: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  vaxStatusText: { fontSize: 9, fontWeight: '900', color: Colors.textSecondary },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyTitle: { fontSize: 12, fontWeight: '700', color: Colors.text },
  historySub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  historyCost: { fontSize: 13, fontWeight: '800', color: Colors.primaryLight },
  emptyHistory: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', paddingVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalHeading: { fontSize: 17, fontWeight: '900', color: Colors.text, marginBottom: 6 },
  modalSub: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.md },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 4 },
  textInput: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
    padding: 10,
    color: Colors.text,
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  speciesPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceCard,
  },
  speciesPillActive: { backgroundColor: Colors.primaryGlow },
  speciesText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  cameraBox: {
    backgroundColor: Colors.surfaceCard,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primaryLight,
    marginBottom: Spacing.md,
  },
  btnScanConfirm: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnScanConfirmText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  btnCancel: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  btnConfirm: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
});
