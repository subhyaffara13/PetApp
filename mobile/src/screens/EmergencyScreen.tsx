import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { EmergencyApi } from '../services/api';

export const EmergencyScreen: React.FC = () => {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default Haifa coordinates or GPS
    EmergencyApi.getNearbyClinics(32.794, 34.9895)
      .then((data) => {
        setClinics(data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCallEmergency = () => {
    Linking.openURL('tel:+972549981122');
  };

  const handleCallClinic = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View style={styles.container}>
      {/* Critical SOS Banner */}
      <View style={styles.sosBanner}>
        <Text style={styles.sosTitle}>🚨 PET IN CRITICAL DISTRESS?</Text>
        <Text style={styles.sosSubtitle}>Immediate 24/7 Veterinary Emergency Hotline</Text>
        <TouchableOpacity style={styles.sosButton} onPress={handleCallEmergency}>
          <Text style={styles.sosButtonText}>📞 CALL EMERGENCY HOTLINE NOW</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Nearest Open Emergency Clinics</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primaryLight} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={(item) => item.id || item._id}
          contentContainerStyle={{ paddingBottom: Spacing.xl }}
          renderItem={({ item }) => (
            <View style={styles.clinicCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.clinicName}>{item.name}</Text>
                <View style={styles.badgeVerified}>
                  <Text style={styles.badgeText}>⭐ 24/7 ER</Text>
                </View>
              </View>
              <Text style={styles.clinicAddress}>📍 {item.address || 'Haifa, Israel'}</Text>
              <Text style={styles.clinicHours}>🟢 {item.openingHours || 'Open 24 Hours'}</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.btnCall}
                  onPress={() => handleCallClinic(item.phone || '+972549981122')}
                >
                  <Text style={styles.btnCallText}>📞 Call Clinic</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnDirections}
                  onPress={() =>
                    Linking.openURL(
                      `https://maps.google.com/?q=${item.location?.lat || 32.794},${item.location?.lng || 34.9895}`
                    )
                  }
                >
                  <Text style={styles.btnDirectionsText}>🧭 Directions</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md },
  sosBanner: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  sosTitle: { ...Typography.h2, color: '#ffffff', textAlign: 'center' },
  sosSubtitle: { ...Typography.body, color: '#fee2e2', textAlign: 'center', marginVertical: 4 },
  sosButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  sosButtonText: { color: Colors.danger, fontWeight: '800', fontSize: 14 },
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  clinicCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clinicName: { ...Typography.h3, flex: 1 },
  badgeVerified: { backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: Colors.success, fontSize: 11, fontWeight: '700' },
  clinicAddress: { ...Typography.body, color: Colors.textMuted, marginTop: 4 },
  clinicHours: { ...Typography.body, color: Colors.success, marginTop: 2, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnCall: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnCallText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  btnDirections: { flex: 1, backgroundColor: Colors.surfaceCard, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnDirectionsText: { color: Colors.text, fontWeight: '700', fontSize: 13 },
});
