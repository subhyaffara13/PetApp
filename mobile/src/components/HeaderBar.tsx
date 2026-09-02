import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useAuth, PortalMode } from '../context/AuthContext';
import { CalendarModal } from './CalendarModal';

interface HeaderBarProps {
  onTriggerSos?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ onTriggerSos }) => {
  const { user, portalMode, setPortalMode } = useAuth();
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const getPortalBadge = () => {
    switch (portalMode) {
      case 'clinic':
        return { label: '🏥 Clinic Station', color: Colors.primaryLight, bg: Colors.primaryGlow };
      case 'store':
        return { label: '🏪 Store Merchant', color: Colors.warningLight, bg: 'rgba(245,158,11,0.15)' };
      default:
        return { label: '🐾 Pet Parent', color: Colors.textSecondary, bg: 'rgba(255,255,255,0.06)' };
    }
  };

  const badge = getPortalBadge();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🐾</Text>
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.appName}>PetSOS</Text>
            <View style={styles.livePulseDot} />
          </View>
          <Text style={styles.cityText}>📍 Haifa & Vicinity</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity
          style={styles.calendarTriggerBtn}
          onPress={() => setShowCalendarModal(true)}
          accessibilityLabel="Open Care Schedule"
        >
          <Text style={{ fontSize: 16 }}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.portalBadgeButton, { backgroundColor: badge.bg, borderColor: badge.color }]}
          onPress={() => setShowPortalModal(true)}
        >
          <Text style={[styles.portalBadgeText, { color: badge.color }]}>{badge.label}</Text>
          <Text style={styles.switchArrow}>▾</Text>
        </TouchableOpacity>
      </View>

      <CalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        userId={user?.id || 'all'}
      />

      {/* Portal Switcher Modal */}
      <Modal visible={showPortalModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPortalModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Switch Active Portal</Text>
            <Text style={styles.modalSubheading}>
              Logged in as: <Text style={{ color: Colors.text, fontWeight: '700' }}>{user?.name || 'Guest User'}</Text>
            </Text>

            <TouchableOpacity
              style={[styles.portalOption, portalMode === 'customer' && styles.portalOptionSelected]}
              onPress={() => {
                setPortalMode('customer');
                setShowPortalModal(false);
              }}
            >
              <Text style={styles.portalOptionIcon}>🐾</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.portalOptionTitle}>Pet Parent (Customer App)</Text>
                <Text style={styles.portalOptionDesc}>24/7 ER Vet triage, pet passport, marketplace & community</Text>
              </View>
              {portalMode === 'customer' && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.portalOption, portalMode === 'clinic' && styles.portalOptionSelected]}
              onPress={() => {
                setPortalMode('clinic');
                setShowPortalModal(false);
              }}
            >
              <Text style={styles.portalOptionIcon}>🏥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.portalOptionTitle}>Clinic & Mobile Vet Station</Text>
                <Text style={styles.portalOptionDesc}>Broadcast live GPS, manage urgent intakes & medical records</Text>
              </View>
              {portalMode === 'clinic' && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.portalOption, portalMode === 'store' && styles.portalOptionSelected]}
              onPress={() => {
                setPortalMode('store');
                setShowPortalModal(false);
              }}
            >
              <Text style={styles.portalOptionIcon}>🏪</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.portalOptionTitle}>Store Merchant Portal</Text>
                <Text style={styles.portalOptionDesc}>Live order fulfillment, Wolt courier dispatch & catalog</Text>
              </View>
              {portalMode === 'store' && <Text style={styles.checkMark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowPortalModal(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.dangerGlow,
    borderWidth: 1,
    borderColor: Colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.dangerLight,
  },
  cityText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
    fontWeight: '500',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  portalBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  calendarTriggerBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  switchArrow: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubheading: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  portalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.surfaceCard,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  portalOptionSelected: {
    borderColor: Colors.primaryLight,
    backgroundColor: 'rgba(56,189,248,0.12)',
  },
  portalOptionIcon: {
    fontSize: 24,
  },
  portalOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  portalOptionDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 15,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primaryLight,
  },
  closeModalButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
