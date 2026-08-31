import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Colors } from './src/theme/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { HeaderBar } from './src/components/HeaderBar';
import { EmergencyScreen } from './src/screens/EmergencyScreen';
import { PassportScreen } from './src/screens/PassportScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ClinicPortalScreen } from './src/screens/clinic/ClinicPortalScreen';
import { StorePortalScreen } from './src/screens/store/StorePortalScreen';

type CustomerTab = 'emergency' | 'passport' | 'community' | 'marketplace' | 'chat';

function MainAppContent() {
  const { portalMode } = useAuth();
  const [activeTab, setActiveTab] = useState<CustomerTab>('emergency');

  const renderContent = () => {
    // 1. Clinic & Mobile Vet Station Mode
    if (portalMode === 'clinic') {
      return <ClinicPortalScreen />;
    }

    // 2. Store Merchant Portal Mode
    if (portalMode === 'store') {
      return <StorePortalScreen />;
    }

    // 3. Customer / Pet Parent Mode (Tabs)
    switch (activeTab) {
      case 'emergency':
        return <EmergencyScreen />;
      case 'community':
        return <CommunityScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'passport':
        return <PassportScreen />;
      case 'marketplace':
        return <MarketplaceScreen />;
      default:
        return <EmergencyScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Dynamic Native Top Header with Portal Switcher */}
      <HeaderBar />

      {/* Main View Area */}
      <View style={styles.content}>{renderContent()}</View>

      {/* Mobile Native Bottom Navigation Bar (Visible in Pet Parent Customer Mode) */}
      {portalMode === 'customer' && (
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
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#0a0f1d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingBottom: 14,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcon: { fontSize: 20 },
  navActive: { transform: [{ scale: 1.15 }] },
  navLabel: { fontSize: 10, color: '#94a3b8', marginTop: 3, fontWeight: '600' },
  navLabelActive: { color: '#38bdf8', fontWeight: '800' },
});
