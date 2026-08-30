import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { CommunityApi } from '../services/api';

export const CommunityScreen: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CommunityApi.getFeed()
      .then((data) => setPosts(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>📸 Community & Safety</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primaryLight} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image source={{ uri: item.petAvatar }} style={styles.avatar} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={Typography.h3}>{item.petName}</Text>
                  <Text style={Typography.caption}>{item.locationTag || 'Haifa, Israel'}</Text>
                </View>
              </View>

              {item.mediaUrl && (
                <Image source={{ uri: item.mediaUrl }} style={styles.postMedia} resizeMode="cover" />
              )}

              <Text style={styles.captionText}>
                <Text style={{ fontWeight: '700' }}>{item.petName} </Text>
                {item.caption}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md },
  headerTitle: { ...Typography.h1, marginBottom: Spacing.md },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  postMedia: { width: '100%', height: 260 },
  captionText: { ...Typography.body, padding: 10 },
});
