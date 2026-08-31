import React, { useState } from 'react';
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
import { Colors, Spacing, Typography } from '../theme/theme';

type Tab = 'feed' | 'lost_found' | 'sitters' | 'shelters';

export const CommunityScreen = () => {
  const [tab, setTab] = useState<Tab>('feed');

  // Shelter Donation Modal
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState('100');

  const handleDonate = () => {
    Alert.alert(
      '❤️ 0% Fee Donation Sent!',
      `Thank you! Your donation of ₪${donationAmount} has been passed 100% directly to ${selectedShelter?.name} with 0% platform deductions.`
    );
    setShowDonateModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Sub-Navbar */}
      <View style={styles.tabNav}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'feed' && styles.tabButtonActive]}
          onPress={() => setTab('feed')}
        >
          <Text style={[styles.tabText, tab === 'feed' && styles.tabTextActive]}>📸 Feed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'lost_found' && styles.tabButtonActiveLost]}
          onPress={() => setTab('lost_found')}
        >
          <Text style={[styles.tabText, tab === 'lost_found' && styles.tabTextActiveLost]}>🚨 Lost & Found</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'sitters' && styles.tabButtonActive]}
          onPress={() => setTab('sitters')}
        >
          <Text style={[styles.tabText, tab === 'sitters' && styles.tabTextActive]}>🐕 Sitters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, tab === 'shelters' && styles.tabButtonActiveShelter]}
          onPress={() => setTab('shelters')}
        >
          <Text style={[styles.tabText, tab === 'shelters' && styles.tabTextActiveShelter]}>🏠 Shelters</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* TAB 1: FEED */}
        {tab === 'feed' && (
          <View>
            <View style={styles.postCard}>
              <View style={styles.postAuthorRow}>
                <View style={styles.authorAvatar}>
                  <Text style={{ fontSize: 16 }}>🐕</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>Maya Cohen & Charlie</Text>
                  <Text style={styles.postTime}>Haifa Central · 2 hours ago</Text>
                </View>
              </View>
              <Text style={styles.postText}>
                Charlie successfully recovered from his ear allergy after treatment at Haifa ER Clinic! Thank you PetSOS for the instant directions and symptom advice. 🐾
              </Text>
              <View style={styles.postLikeRow}>
                <Text style={styles.likeText}>❤️ 24 Likes · 5 Comments</Text>
              </View>
            </View>

            <View style={styles.postCard}>
              <View style={styles.postAuthorRow}>
                <View style={styles.authorAvatar}>
                  <Text style={{ fontSize: 16 }}>🐈</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>David Levi</Text>
                  <Text style={styles.postTime}>Bat Galim, Haifa · Yesterday</Text>
                </View>
              </View>
              <Text style={styles.postText}>
                Just scanned Bella's new vaccination invoice directly into her Pet Passport. The OCR feature saved me so much time!
              </Text>
              <View style={styles.postLikeRow}>
                <Text style={styles.likeText}>❤️ 19 Likes · 2 Comments</Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 2: LOST & FOUND SOS */}
        {tab === 'lost_found' && (
          <View>
            <View style={styles.lostHeaderAlert}>
              <Text style={styles.lostAlertTitle}>🚨 ACTIVE MISSING PET ALERTS</Text>
              <Text style={styles.lostAlertSub}>Broadcast to pet parents and clinics within a 5 km radius</Text>
            </View>

            <View style={[styles.postCard, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}>
              <View style={styles.lostPetBadge}>
                <Text style={styles.lostPetBadgeText}>MISSING DOG · REWARD OFFERED</Text>
              </View>
              <Text style={styles.lostPetName}>Buddy — Beagle (Male)</Text>
              <Text style={styles.lostPetDetails}>
                Last seen near Panorama Promenade, Central Carmel, Haifa. Wearing a red collar with microchip tag #90021500099812.
              </Text>
              <TouchableOpacity
                style={styles.btnContactOwner}
                onPress={() => Alert.alert('Contact Owner', 'Phone: +972-52-881-2299\nWhatsApp: Active')}
              >
                <Text style={styles.btnContactOwnerText}>📞 Sighting / Contact Owner</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 3: PET SITTERS */}
        {tab === 'sitters' && (
          <View>
            <View style={styles.sitterCard}>
              <View style={styles.sitterTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.sitterName}>Noam Shapira</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>VERIFIED SITTER</Text>
                    </View>
                  </View>
                  <Text style={styles.sitterLocation}>📍 French Carmel, Haifa</Text>
                </View>
                <Text style={styles.sitterRate}>₪65<Text style={{ fontSize: 11, color: Colors.textMuted }}>/hr</Text></Text>
              </View>
              <Text style={styles.sitterBio}>
                5+ years experience with high-energy dogs, rescue puppies, and senior cats. Certified in pet first aid.
              </Text>
              <TouchableOpacity
                style={styles.btnBookSitter}
                onPress={() => Alert.alert('Book Sitter', 'Booking request sent to Noam. Direct chat opened!')}
              >
                <Text style={styles.btnBookSitterText}>📅 Book Drop-in Visit / Dog Walk</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sitterCard}>
              <View style={styles.sitterTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.sitterName}>Tamar Ben-David</Text>
                    <View style={styles.verifiedBadge}>
                      <Text style={styles.verifiedBadgeText}>VERIFIED SITTER</Text>
                    </View>
                  </View>
                  <Text style={styles.sitterLocation}>📍 Ahuza, Haifa</Text>
                </View>
                <Text style={styles.sitterRate}>₪70<Text style={{ fontSize: 11, color: Colors.textMuted }}>/hr</Text></Text>
              </View>
              <Text style={styles.sitterBio}>
                Specialist in feline care, medication administration, and overnight pet sitting in your home.
              </Text>
              <TouchableOpacity
                style={styles.btnBookSitter}
                onPress={() => Alert.alert('Book Sitter', 'Booking request sent to Tamar.')}
              >
                <Text style={styles.btnBookSitterText}>📅 Book Drop-in Visit / Sitting</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 4: SHELTERS & 0% DONATIONS */}
        {tab === 'shelters' && (
          <View>
            <View style={styles.zeroFeeBanner}>
              <Text style={styles.zeroFeeTitle}>🛡️ 100% Non-Profit Giving</Text>
              <Text style={styles.zeroFeeSub}>
                PetSOS charges 0% platform fees on shelter donations. Every shekel goes directly to medical care & food for rescue animals.
              </Text>
            </View>

            <View style={styles.shelterCard}>
              <Text style={styles.shelterName}>🏠 SOS Pets Rescue & Sanctuary Haifa</Text>
              <Text style={styles.shelterAddress}>📍 Haifa Bay Non-Profit Shelter · 64 Animals in Care</Text>
              <Text style={styles.shelterDesc}>
                Providing life-saving trauma surgery, rehabilitation, and loving adoptions for abandoned dogs and cats across northern Israel.
              </Text>

              <View style={styles.shelterActionsRow}>
                <TouchableOpacity
                  style={styles.btnDonateShelter}
                  onPress={() => {
                    setSelectedShelter({ name: 'SOS Pets Rescue Haifa' });
                    setShowDonateModal(true);
                  }}
                >
                  <Text style={styles.btnDonateShelterText}>❤️ Donate (0% Fee)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnAdoptShelter}
                  onPress={() => Alert.alert('Adoptable Pets', 'Viewing 14 rescue pets currently ready for adoption in Haifa!')}
                >
                  <Text style={styles.btnAdoptShelterText}>🐾 View Adoptions</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* 0% Fee Donation Modal */}
      <Modal visible={showDonateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalHeading}>❤️ 0% Platform Fee Donation</Text>
            <Text style={styles.modalSub}>
              Supporting: <Text style={{ color: Colors.successLight, fontWeight: '700' }}>{selectedShelter?.name}</Text>
            </Text>

            <Text style={styles.inputLabel}>Select Donation Amount</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md }}>
              {['50', '100', '200', '500'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.amtBtn, donationAmount === amt && styles.amtBtnActive]}
                  onPress={() => setDonationAmount(amt)}
                >
                  <Text style={[styles.amtBtnText, donationAmount === amt && { color: Colors.successLight }]}>
                    ₪{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.zeroFeeGuaranteeBox}>
              <Text style={{ fontSize: 11, color: Colors.successLight, fontWeight: '700' }}>
                ✓ Guaranteed 0% Platform Commission
              </Text>
              <Text style={{ fontSize: 10, color: Colors.textMuted, marginTop: 2 }}>
                100% of your ₪{donationAmount} donation is transferred directly to the shelter.
              </Text>
            </View>

            <TouchableOpacity style={styles.btnConfirmDonate} onPress={handleDonate}>
              <Text style={styles.btnConfirmDonateText}>❤️ Donate ₪{donationAmount} to Shelter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={() => setShowDonateModal(false)}>
              <Text style={{ color: Colors.textMuted, fontWeight: '700', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  tabNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: { backgroundColor: Colors.primaryGlow },
  tabButtonActiveLost: { backgroundColor: Colors.dangerGlow },
  tabButtonActiveShelter: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  tabText: { fontSize: 11, color: Colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: Colors.primaryLight, fontWeight: '900' },
  tabTextActiveLost: { color: Colors.dangerLight, fontWeight: '900' },
  tabTextActiveShelter: { color: Colors.successLight, fontWeight: '900' },
  scrollArea: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 24 },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: { fontSize: 13, fontWeight: '800', color: Colors.text },
  postTime: { fontSize: 10, color: Colors.textMuted },
  postText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  postLikeRow: { borderTopWidth: 1, borderColor: Colors.border, paddingTop: 6 },
  likeText: { fontSize: 11, color: Colors.textMuted },
  lostHeaderAlert: {
    backgroundColor: Colors.dangerGlow,
    padding: 10,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  lostAlertTitle: { fontSize: 12, fontWeight: '900', color: Colors.dangerLight },
  lostAlertSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  lostPetBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  lostPetBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  lostPetName: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  lostPetDetails: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 10 },
  btnContactOwner: {
    backgroundColor: Colors.danger,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnContactOwnerText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  sitterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sitterTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sitterName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  verifiedBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: { color: Colors.primaryLight, fontSize: 9, fontWeight: '800' },
  sitterLocation: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  sitterRate: { fontSize: 18, fontWeight: '900', color: Colors.purpleLight },
  sitterBio: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 10 },
  btnBookSitter: {
    backgroundColor: Colors.purple,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnBookSitterText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  zeroFeeBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 12,
    borderRadius: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  zeroFeeTitle: { fontSize: 13, fontWeight: '900', color: Colors.successLight },
  zeroFeeSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 3, lineHeight: 15 },
  shelterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shelterName: { fontSize: 15, fontWeight: '800', color: Colors.text },
  shelterAddress: { fontSize: 11, color: Colors.textMuted, marginVertical: 3 },
  shelterDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 12 },
  shelterActionsRow: { flexDirection: 'row', gap: Spacing.sm },
  btnDonateShelter: {
    flex: 1,
    backgroundColor: Colors.success,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDonateShelterText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  btnAdoptShelter: {
    flex: 1,
    backgroundColor: Colors.surfaceCard,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnAdoptShelterText: { color: Colors.text, fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalHeading: { fontSize: 17, fontWeight: '900', color: Colors.text, marginBottom: 4 },
  modalSub: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.md },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 6 },
  amtBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
    alignItems: 'center',
  },
  amtBtnActive: { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderWidth: 1, borderColor: Colors.success },
  amtBtnText: { fontSize: 13, fontWeight: '800', color: Colors.text },
  zeroFeeGuaranteeBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 10,
    borderRadius: 8,
    marginVertical: Spacing.md,
  },
  btnConfirmDonate: {
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnConfirmDonateText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  btnCancel: { paddingVertical: 10, marginTop: 4 },
});
