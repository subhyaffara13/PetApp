import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from './src/theme/theme';
import { EmergencyScreen } from './src/screens/EmergencyScreen';
import { PassportScreen } from './src/screens/PassportScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { ChatScreen } from './src/screens/ChatScreen';

type Tab = 'emergency' | 'passport' | 'community' | 'marketplace' | 'chat';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('emergency');

  const renderScreen = () => {
    switch (activeTab) {
      case 'emergency': return <EmergencyScreen />;
      case 'passport': return <PassportScreen />;
      case 'community': return <CommunityScreen />;
      case 'marketplace': return <MarketplaceScreen />;
      case 'chat': return <ChatScreen />;
      default: return <EmergencyScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View style={styles.content}>{renderScreen()}</View>

      {/* Mobile Native Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('emergency')}>
          <Text style={[styles.navIcon, activeTab === 'emergency' && styles.navActive]}>🚨</Text>
          <Text style={[styles.navLabel, activeTab === 'emergency' && styles.navLabelActive]}>SOS ER</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('community')}>
          <Text style={[styles.navIcon, activeTab === 'community' && styles.navActive]}>📸</Text>
          <Text style={[styles.navLabel, activeTab === 'community' && styles.navLabelActive]}>Community</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('chat')}>
          <Text style={[styles.navIcon, activeTab === 'chat' && styles.navActive]}>💬</Text>
          <Text style={[styles.navLabel, activeTab === 'chat' && styles.navLabelActive]}>AI Assistant</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('passport')}>
          <Text style={[styles.navIcon, activeTab === 'passport' && styles.navActive]}>🐾</Text>
          <Text style={[styles.navLabel, activeTab === 'passport' && styles.navLabelActive]}>Passports</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('marketplace')}>
          <Text style={[styles.navIcon, activeTab === 'marketplace' && styles.navActive]}>🛍️</Text>
          <Text style={[styles.navLabel, activeTab === 'marketplace' && styles.navLabelActive]}>Marketplace</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 8,
    paddingBottom: 14,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 20 },
  navActive: { transform: [{ scale: 1.15 }] },
  navLabel: { fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: '600' },
  navLabelActive: { color: '#38bdf8', fontWeight: '800' },
});
