import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { MarketplaceApi } from '../services/api';

export const MarketplaceScreen: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    MarketplaceApi.getShops()
      .then((data) => setShops(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🛍️ Pet Supplies & Food</Text>
      <Text style={styles.headerSubtitle}>Local stores with Wolt/Uber courier dispatch & store pickup</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primaryLight} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.shopCard}>
              <Image
                source={{
                  uri:
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
                }}
                style={styles.shopImage}
              />
              <View style={styles.shopInfo}>
                <Text style={Typography.h3}>{item.name}</Text>
                <Text style={Typography.caption}>📍 {item.address}</Text>
                <View style={styles.tagRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🛵 Delivery Available</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>🛍️ Store Pickup (₪0)</Text>
                  </View>
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
  shopCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shopImage: { width: '100%', height: 140 },
  shopInfo: { padding: Spacing.md },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  badge: { backgroundColor: Colors.surfaceCard, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  badgeText: { fontSize: 11, color: Colors.primaryLight, fontWeight: '600' },
});
