import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../theme/theme';
import { EmergencyApi, ClinicPortalApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface IntakeItem {
  id: string;
  petName: string;
  species: string;
  ownerName: string;
  ownerPhone: string;
  symptoms: string;
  etaMinutes: number;
  status: 'pending' | 'accepted' | 'in_treatment';
  severity: 'critical' | 'moderate';
}

const SAMPLE_INTAKES: IntakeItem[] = [
  {
    id: 'intake_1',
    petName: 'Rocky',
    species: 'Dog (German Shepherd)',
    ownerName: 'Subhy Affara',
    ownerPhone: '+972-50-998-3344',
    symptoms: 'Acute bloat symptoms, pale gums, pacing in distress',
    etaMinutes: 8,
    status: 'pending',
    severity: 'critical',
  },
  {
    id: 'intake_2',
    petName: 'Simba',
    species: 'Cat (Persian)',
    ownerName: 'Elena V.',
    ownerPhone: '+972-54-112-9900',
    symptoms: 'Eye trauma & continuous tearing after cat fight',
    etaMinutes: 20,
    status: 'accepted',
    severity: 'moderate',
  },
];

export const ClinicPortalScreen = () => {
  const { user } = useAuth();
  const [isBroadcastingGps, setIsBroadcastingGps] = useState(true);
  const [intakes, setIntakes] = useState<IntakeItem[]>(SAMPLE_INTAKES);
  const [clinicTab, setClinicTab] = useState<'intakes' | 'gps' | 'pharmacy'>('intakes');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Toggle GPS broadcasting for mobile vets
  const handleToggleGps = async (val: boolean) => {
    setIsBroadcastingGps(val);
    try {
      await EmergencyApi.updateMobileVetLocation(user?.id || 'vet_subhy', {
        lat: 32.794,
        lng: 34.9896,
        isActive: val,
      });
      if (val) {
        Alert.alert('🚐 GPS Broadcasting Live', 'Your mobile veterinary unit is now visible to pet parents across Haifa on the live emergency map!');
      } else {
        Alert.alert('⏹ Off-Duty', 'GPS broadcasting paused.');
      }
    } catch {
      // Offline fallback
    }
  };

  const handleAcceptIntake = (intakeId: string) => {
    setIntakes((prev) =>
      prev.map((it) => (it.id === intakeId ? { ...it, status: 'accepted' } : it))
    );
    Alert.alert('✅ Trauma Bay Ready', 'Intake accepted. Notification sent to pet owner with emergency preparation instructions.');
  };

  return (
    <View style={styles.container}>
      {/* Vet Portal Sub-Header */}
      <View style={styles.portalBanner}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.bannerTitle}>🏥 Clinic & Mobile Vet EMR Station</Text>
          </View>
          <Text style={styles.bannerSub}>Dr. {user?.name || 'Subhy Affara'} · License #ISR-VET-99214</Text>
        </View>

        {/* Live GPS Broadcasting Toggle for Ambulatory Vets */}
        <View style={styles.gpsToggleBox}>
          <Text style={[styles.gpsToggleLabel, isBroadcastingGps && { color: Colors.mobileVetLight }]}>
            {isBroadcastingGps ? '🚐 GPS LIVE' : 'OFF DUTY'}
          </Text>
          <Switch
            value={isBroadcastingGps}
            onValueChange={handleToggleGps}
            trackColor={{ false: '#334155', true: Colors.mobileVet }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Segmented Sub Tabs */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTabBtn, clinicTab === 'intakes' && styles.subTabBtnActive]}
          onPress={() => setClinicTab('intakes')}
        >
          <Text style={[styles.subTabText, clinicTab === 'intakes' && styles.subTabTextActive]}>
            🚨 Urgent Intakes ({intakes.filter((i) => i.status === 'pending').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, clinicTab === 'gps' && styles.subTabBtnActiveMobile]}
          onPress={() => setClinicTab('gps')}
        >
          <Text style={[styles.subTabText, clinicTab === 'gps' && styles.subTabTextActiveMobile]}>
            🚐 Mobile Unit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, clinicTab === 'pharmacy' && styles.subTabBtnActive]}
          onPress={() => setClinicTab('pharmacy')}
        >
          <Text style={[styles.subTabText, clinicTab === 'pharmacy' && styles.subTabTextActive]}>
            📦 Wolt Meds PIN
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Scroll Content */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* TAB 1: URGENT INTAKES */}
        {clinicTab === 'intakes' && (
          <View>
            <View style={styles.intakeHeaderNote}>
              <Text style={styles.noteTitle}>⚡ Live Emergency Inbound Feed</Text>
              <Text style={styles.noteDesc}>
                Real-time patient distress dossiers transmitted from pet parents en route to your clinic.
              </Text>
            </View>

            {intakes.map((intake) => {
              const isCrit = intake.severity === 'critical';
              const isPending = intake.status === 'pending';

              return (
                <View
                  key={intake.id}
                  style={[styles.intakeCard, isCrit ? styles.intakeCardCrit : styles.intakeCardMod]}
                >
                  <View style={styles.intakeTopRow}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.intakePetName}>{intake.petName}</Text>
                        <View style={[styles.sevBadge, isCrit ? styles.sevCrit : styles.sevMod]}>
                          <Text style={styles.sevText}>{isCrit ? '🚨 CRITICAL TRAUMA' : '🟡 MODERATE'}</Text>
                        </View>
                      </View>
                      <Text style={styles.intakeSpecies}>{intake.species} · Owner: {intake.ownerName}</Text>
                    </View>

                    <View style={styles.etaBox}>
                      <Text style={styles.etaTitle}>ETA</Text>
                      <Text style={styles.etaVal}>{intake.etaMinutes} min</Text>
                    </View>
                  </View>

                  <View style={styles.symptomsBox}>
                    <Text style={styles.symptomsLabel}>Reported Distress Symptoms:</Text>
                    <Text style={styles.symptomsText}>{intake.symptoms}</Text>
                  </View>

                  <View style={styles.intakeActionsRow}>
                    {isPending ? (
                      <TouchableOpacity
                        style={styles.btnAcceptBay}
                        onPress={() => handleAcceptIntake(intake.id)}
                      >
                        <Text style={styles.btnAcceptBayText}>⚡ Accept & Prepare Trauma Bay</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.acceptedBadge}>
                        <Text style={styles.acceptedBadgeText}>✓ Trauma Bay Prepared</Text>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.btnCallOwner}
                      onPress={() => Linking.openURL(`tel:${intake.ownerPhone}`)}
                    >
                      <Text style={styles.btnCallOwnerText}>📞 Call Parent</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: MOBILE UNIT GPS BROADCAST */}
        {clinicTab === 'gps' && (
          <View>
            <View style={styles.mobileUnitCard}>
              <View style={styles.mobileUnitHeader}>
                <Text style={{ fontSize: 32 }}>🚐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mobileUnitTitle}>Mobile Ambulatory Vet Dispatch</Text>
                  <Text style={styles.mobileUnitStatus}>
                    Status: <Text style={{ color: isBroadcastingGps ? Colors.mobileVetLight : Colors.textMuted, fontWeight: '800' }}>
                      {isBroadcastingGps ? 'ON DUTY (BROADCASTING)' : 'OFF DUTY'}
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.gpsCoordBox}>
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>APPROXIMATE LATITUDE</Text>
                  <Text style={styles.coordVal}>32.7940° N</Text>
                </View>
                <View style={styles.coordRow}>
                  <Text style={styles.coordLabel}>APPROXIMATE LONGITUDE</Text>
                  <Text style={styles.coordVal}>34.9896° E</Text>
                </View>
              </View>

              <Text style={styles.gpsExplainText}>
                While ON DUTY, your vehicle broadcasts an approximate proximity radius so pet owners in immediate distress can see that a doctor on wheels is operating nearby.
              </Text>

              <TouchableOpacity
                style={[styles.btnToggleGpsBig, isBroadcastingGps ? styles.btnGpsOff : styles.btnGpsOn]}
                onPress={() => handleToggleGps(!isBroadcastingGps)}
              >
                <Text style={styles.btnToggleGpsBigText}>
                  {isBroadcastingGps ? '⏹ Pause GPS Broadcasting' : '📡 Start Live GPS Broadcasting'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 3: WOLT MEDS FULFILLMENT PIN */}
        {clinicTab === 'pharmacy' && (
          <View>
            <View style={styles.pharmacyBanner}>
              <Text style={styles.pharmacyBannerTitle}>🔷 Outgoing Wolt Medication Orders</Text>
              <Text style={styles.pharmacyBannerSub}>
                Provide the 5-character verification PIN to the Wolt courier upon package handoff.
              </Text>
            </View>

            <View style={styles.orderHandoffCard}>
              <View style={styles.handoffHeader}>
                <Text style={styles.handoffOrderId}>ORDER #A49F1</Text>
                <View style={styles.woltBadgePill}>
                  <Text style={styles.woltBadgePillText}>🔷 WOLT COURIER EN ROUTE</Text>
                </View>
              </View>

              <View style={styles.pinHandoffBox}>
                <Text style={styles.pinLabel}>📦 WOLT COURIER PICKUP PIN:</Text>
                <Text style={styles.pinValue}>#A49F1</Text>
              </View>

              <Text style={styles.handoffItems}>
                Items: 1x Amoxicillin 250mg, 1x Sterile Gauze Wrap
              </Text>

              <TouchableOpacity
                style={styles.btnHandoffDone}
                onPress={() => Alert.alert('Handoff Complete', 'Package released to Wolt driver.')}
              >
                <Text style={styles.btnHandoffDoneText}>✓ Confirm Courier Handoff</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  portalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bannerTitle: { fontSize: 13, fontWeight: '900', color: Colors.primaryLight },
  bannerSub: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  gpsToggleBox: { alignItems: 'center', gap: 2 },
  gpsToggleLabel: { fontSize: 9, fontWeight: '900', color: Colors.textMuted },
  subTabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabBtnActive: { backgroundColor: Colors.primaryGlow },
  subTabBtnActiveMobile: { backgroundColor: Colors.mobileVetGlow },
  subTabText: { fontSize: 11, color: Colors.textMuted, fontWeight: '700' },
  subTabTextActive: { color: Colors.primaryLight, fontWeight: '900' },
  subTabTextActiveMobile: { color: Colors.mobileVetLight, fontWeight: '900' },
  scrollArea: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 24 },
  intakeHeaderNote: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  noteTitle: { fontSize: 12, fontWeight: '800', color: Colors.primaryLight },
  noteDesc: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  intakeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  intakeCardCrit: { borderColor: 'rgba(239, 68, 68, 0.4)' },
  intakeCardMod: { borderColor: Colors.border },
  intakeTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  intakePetName: { fontSize: 16, fontWeight: '900', color: Colors.text },
  sevBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sevCrit: { backgroundColor: Colors.dangerGlow },
  sevMod: { backgroundColor: 'rgba(245, 158, 11, 0.15)' },
  sevText: { fontSize: 9, fontWeight: '900', color: Colors.dangerLight },
  intakeSpecies: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  etaBox: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  etaTitle: { fontSize: 8, color: Colors.textMuted, fontWeight: '700' },
  etaVal: { fontSize: 13, fontWeight: '900', color: Colors.primaryLight },
  symptomsBox: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  symptomsLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  symptomsText: { fontSize: 12, color: Colors.text, marginTop: 2, lineHeight: 16 },
  intakeActionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  btnAcceptBay: {
    flex: 2,
    backgroundColor: Colors.danger,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAcceptBayText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  acceptedBadge: {
    flex: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptedBadgeText: { color: Colors.successLight, fontSize: 11, fontWeight: '800' },
  btnCallOwner: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCallOwnerText: { color: Colors.text, fontSize: 11, fontWeight: '700' },
  mobileUnitCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.mobileVet,
  },
  mobileUnitHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  mobileUnitTitle: { fontSize: 15, fontWeight: '900', color: Colors.text },
  mobileUnitStatus: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  gpsCoordBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 10,
    padding: 10,
    marginBottom: Spacing.md,
  },
  coordRow: { flex: 1, alignItems: 'center' },
  coordLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '700' },
  coordVal: { fontSize: 12, color: Colors.mobileVetLight, fontWeight: '800', fontFamily: 'monospace', marginTop: 2 },
  gpsExplainText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: Spacing.lg },
  btnToggleGpsBig: { paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  btnGpsOn: { backgroundColor: Colors.mobileVet },
  btnGpsOff: { backgroundColor: Colors.surfaceCard, borderWidth: 1, borderColor: Colors.border },
  btnToggleGpsBigText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  pharmacyBanner: {
    backgroundColor: 'rgba(0, 194, 232, 0.1)',
    padding: 10,
    borderRadius: 10,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 194, 232, 0.2)',
  },
  pharmacyBannerTitle: { fontSize: 12, fontWeight: '800', color: Colors.woltBlue },
  pharmacyBannerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  orderHandoffCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handoffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  handoffOrderId: { fontSize: 13, fontWeight: '800', color: Colors.text },
  woltBadgePill: { backgroundColor: 'rgba(0, 194, 232, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  woltBadgePillText: { fontSize: 9, color: Colors.woltBlue, fontWeight: '900' },
  pinHandoffBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.purple,
  },
  pinLabel: { fontSize: 10, color: Colors.purpleLight, fontWeight: '800' },
  pinValue: { fontSize: 22, fontWeight: '900', color: '#fff', fontFamily: 'monospace', marginTop: 2 },
  handoffItems: { fontSize: 11, color: Colors.textMuted, marginBottom: Spacing.md },
  btnHandoffDone: { backgroundColor: Colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnHandoffDoneText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
