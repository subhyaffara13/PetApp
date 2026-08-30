import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { PetProfileApi } from '../services/api';

export const PassportScreen: React.FC = () => {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PetProfileApi.getPets()
      .then((data) => setPets(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🐾 Pet Health Passports</Text>
      <Text style={styles.headerSubtitle}>Verified clinical dossiers, vaccinations & medical history</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primaryLight} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <View style={styles.petCard}>
              <View style={styles.petHeader}>
                <View style={styles.petAvatar}>
                  <Text style={{ fontSize: 24 }}>{item.species === 'cat' ? '🐈' : '🐕'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={Typography.h3}>{item.name}</Text>
                  <Text style={{ color: Colors.textMuted }}>{item.breed || 'Companion'}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Age</Text>
                  <Text style={styles.statVal}>
                    {item.age !== undefined && item.age < 1
                      ? `${Math.round(item.age * 12) || 2}m (חודשים)`
                      : `${item.age} yrs`}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Weight</Text>
                  <Text style={styles.statVal}>{item.weight} kg</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Gender</Text>
                  <Text style={styles.statVal}>{item.gender === 'male' ? '♂ Male' : '♀ Female'}</Text>
                </View>
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
  headerTitle: { ...Typography.h1, marginBottom: 2 },
  headerSubtitle: { ...Typography.body, color: Colors.textMuted, marginBottom: Spacing.md },
  petCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  petHeader: { flexDirection: 'row', alignItems: 'center' },
  petAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: Colors.textMuted },
  statVal: { fontSize: 13, fontWeight: '700', color: Colors.text, marginTop: 2 },
});
