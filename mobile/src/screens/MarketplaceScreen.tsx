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
  Linking,
} from 'react-native';
import { Colors, Spacing } from '../theme/theme';
import { MarketplaceApi } from '../services/api';

interface Product {
  id: string;
  name: string;
  category: 'Food' | 'Medication' | 'Treats' | 'Supplies';
  price: number;
  isEmergencyItem?: boolean;
  storeName: string;
  distanceKm?: number;
}

interface NearbyStore {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  isOpen: boolean;
  isPharmacy: boolean;
  woltDelivery: boolean;
}

const SAMPLE_STORES: NearbyStore[] = [
  {
    id: 's1',
    name: 'Carmel Pet Care & 24/7 Pharmacy',
    address: 'HaNassi Ave 45, Central Carmel, Haifa',
    distanceKm: 0.6,
    isOpen: true,
    isPharmacy: true,
    woltDelivery: true,
  },
  {
    id: 's2',
    name: 'Haifa Animal Supplies & Nutrition Hub',
    address: 'Moriah Ave 112, Ahuza, Haifa',
    distanceKm: 1.2,
    isOpen: true,
    isPharmacy: false,
    woltDelivery: true,
  },
  {
    id: 's3',
    name: 'VetCare Express Prescription Depot',
    address: 'HaAliya HaShniya St 39, Bat Galim, Haifa',
    distanceKm: 2.4,
    isOpen: true,
    isPharmacy: true,
    woltDelivery: false,
  },
];

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Veterinary Broad-Spectrum Antibiotic Ointment',
    category: 'Medication',
    price: 85,
    isEmergencyItem: true,
    storeName: 'Carmel Pet Care & Pharmacy',
    distanceKm: 0.6,
  },
  {
    id: 'p2',
    name: 'Royal Canin Veterinary Diet Gastrointestinal 2kg',
    category: 'Food',
    price: 135,
    isEmergencyItem: true,
    storeName: 'Haifa Animal Supplies Hub',
    distanceKm: 1.2,
  },
  {
    id: 'p3',
    name: 'Emergency Pet Wound Care Sterile Bandage Kit',
    category: 'Supplies',
    price: 49,
    isEmergencyItem: true,
    storeName: 'Carmel Pet Care & Pharmacy',
    distanceKm: 0.6,
  },
  {
    id: 'p4',
    name: 'Bravecto Chewable Tick & Flea Prevention for Dogs',
    category: 'Medication',
    price: 189,
    isEmergencyItem: false,
    storeName: 'Haifa Animal Supplies Hub',
    distanceKm: 1.2,
  },
  {
    id: 'p5',
    name: 'Orijen Grain-Free Original Dog Food 11.4kg',
    category: 'Food',
    price: 389,
    isEmergencyItem: false,
    storeName: 'Haifa Animal Supplies Hub',
    distanceKm: 1.2,
  },
];

export const MarketplaceScreen = () => {
  const [stores, setStores] = useState<NearbyStore[]>(SAMPLE_STORES);
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Medication' | 'Food' | 'Supplies'>('All');
  const [searchStreet, setSearchStreet] = useState('');
  const [selectedStore, setSelectedStore] = useState<NearbyStore | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [deliveryMode, setDeliveryMode] = useState<'wolt' | 'pickup'>('wolt');

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryStreet, setDeliveryStreet] = useState('HaNassi Ave 42, Apt 5');
  const [deliveryCity, setDeliveryCity] = useState('Haifa');
  const [deliveryNotes, setDeliveryNotes] = useState('Door code #4912, leave at door');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchStreet.trim() ||
      p.name.toLowerCase().includes(searchStreet.toLowerCase()) ||
      p.storeName.toLowerCase().includes(searchStreet.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter === 'All') return true;
    return p.category === categoryFilter;
  });

  const cartCount = Object.values(cart).reduce((sum: number, q: number) => sum + q, 0);
  const cartSubtotal = Object.entries(cart).reduce((sum: number, [pId, qty]: [string, number]) => {
    const item = products.find((p) => p.id === pId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const deliveryFee = deliveryMode === 'wolt' ? 22 : 0;
  const grandTotal = cartSubtotal + deliveryFee;

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return { ...prev, [productId]: current - 1 };
    });
  };

  const handleCheckout = async () => {
    setIsPlacingOrder(true);
    setTimeout(() => {
      setIsPlacingOrder(false);
      setShowCheckout(false);
      setCart({});
      const randomOrderPin = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      Alert.alert(
        '🎉 Order Placed Successfully!',
        deliveryMode === 'wolt'
          ? `Wolt Courier has been dispatched!\nCourier Pickup Verification PIN: ${randomOrderPin}\nEstimated Delivery: 25-35 mins.`
          : `Order packaged for Counter Pickup!\nYour Pickup Verification PIN: ${randomOrderPin}`
      );
    }, 1200);
  };

  const handleOpenMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* 1. Wolt DaaS Header */}
      <View style={styles.woltBanner}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.woltTitle}>🔷 Wolt Drive On-Demand Delivery</Text>
            <View style={styles.speedBadge}>
              <Text style={styles.speedBadgeText}>⚡ 25-35 MIN</Text>
            </View>
          </View>
          <Text style={styles.woltSub}>Interactive store radar, 30-min courier delivery & counter pickup</Text>
        </View>
      </View>

      {/* 2. Street-Level Address Search Bar */}
      <View style={styles.searchBarContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search street, store, or product..."
          placeholderTextColor={Colors.textMuted}
          value={searchStreet}
          onChangeText={setSearchStreet}
        />
        {searchStreet.length > 0 && (
          <TouchableOpacity onPress={() => setSearchStreet('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Interactive Store Radar Map Card */}
      <View style={styles.storeRadarCard}>
        <View style={styles.radarHeader}>
          <View style={styles.radarDotPulse}>
            <View style={styles.radarDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.radarTitle}>🗺️ Nearby Pet Stores & Pharmacies</Text>
            <Text style={styles.radarSub}>{stores.length} verified stores in proximity</Text>
          </View>
          <TouchableOpacity
            style={styles.btnOpenAllMaps}
            onPress={() => handleOpenMaps(searchStreet || 'Haifa Pet Stores')}
          >
            <Text style={styles.btnOpenAllMapsText}>Open Map ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Store Quick Selector Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storeChipsRow}>
          {stores.map((s) => {
            const isSel = selectedStore?.id === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.storeChip, isSel && styles.storeChipActive]}
                onPress={() => setSelectedStore(isSel ? null : s)}
              >
                <Text style={[styles.storeChipText, isSel && styles.storeChipTextActive]}>
                  {s.isPharmacy ? '💊' : '🛍️'} {s.name.split(' ')[0]} ({s.distanceKm} km)
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Category Filter Pills */}
      <View style={styles.filterRow}>
        {(['All', 'Medication', 'Food', 'Supplies'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterPill, categoryFilter === cat && styles.filterPillActive]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={[styles.filterPillText, categoryFilter === cat && styles.filterPillTextActive]}>
              {cat === 'Medication' ? '🚨 Emergency Meds' : cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 5. Product & Store Catalog List */}
      <ScrollView style={styles.catalogScroll} contentContainerStyle={styles.catalogContent}>
        {filteredProducts.map((product) => {
          const qty = cart[product.id] || 0;

          return (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productTopRow}>
                <View style={{ flex: 1 }}>
                  {product.isEmergencyItem && (
                    <View style={styles.emergencyPill}>
                      <Text style={styles.emergencyPillText}>🚨 URGENT MEDICATION</Text>
                    </View>
                  )}
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.storeName}>
                    🏪 {product.storeName} · 📍 {product.distanceKm} km
                  </Text>
                </View>
                <Text style={styles.priceText}>₪{product.price}</Text>
              </View>

              <View style={styles.productActionRow}>
                <View style={styles.woltBadge}>
                  <Text style={styles.woltBadgeText}>🔷 Wolt Dispatch Ready</Text>
                </View>

                {qty === 0 ? (
                  <TouchableOpacity style={styles.btnAddCart} onPress={() => addToCart(product.id)}>
                    <Text style={styles.btnAddCartText}>+ Add to Cart</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.qtyControlRow}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(product.id)}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValue}>{qty}</Text>
                    <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(product.id)}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* 6. Floating Cart Bar */}
      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View>
            <Text style={styles.cartItemCount}>{cartCount} items in Cart</Text>
            <Text style={styles.cartTotalPrice}>₪{cartSubtotal.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.btnCheckout} onPress={() => setShowCheckout(true)}>
            <Text style={styles.btnCheckoutText}>Checkout with Wolt ➔</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 7. Checkout Modal */}
      <Modal visible={showCheckout} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalHeading}>🛍️ Complete Order Checkout</Text>

            {/* Delivery Mode Toggle */}
            <View style={styles.deliveryModeRow}>
              <TouchableOpacity
                style={[styles.deliveryModeBtn, deliveryMode === 'wolt' && styles.deliveryModeBtnActive]}
                onPress={() => setDeliveryMode('wolt')}
              >
                <Text style={[styles.deliveryModeText, deliveryMode === 'wolt' && { color: Colors.woltBlue }]}>
                  🔷 Wolt Drive (₪22)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deliveryModeBtn, deliveryMode === 'pickup' && styles.deliveryModeBtnActive]}
                onPress={() => setDeliveryMode('pickup')}
              >
                <Text style={[styles.deliveryModeText, deliveryMode === 'pickup' && { color: Colors.successLight }]}>
                  🛍️ Self Counter Pickup (Free)
                </Text>
              </TouchableOpacity>
            </View>

            {deliveryMode === 'wolt' && (
              <View style={{ marginBottom: Spacing.sm }}>
                <Text style={styles.inputLabel}>Delivery Street & Apartment</Text>
                <TextInput
                  style={styles.textInput}
                  value={deliveryStreet}
                  onChangeText={setDeliveryStreet}
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.textInput}
                  value={deliveryCity}
                  onChangeText={setDeliveryCity}
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={styles.inputLabel}>Courier Delivery Notes</Text>
                <TextInput
                  style={styles.textInput}
                  value={deliveryNotes}
                  onChangeText={setDeliveryNotes}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            )}

            {/* Order Summary Box */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryVal}>₪{cartSubtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee ({deliveryMode === 'wolt' ? 'Wolt Drive' : 'Pickup'})</Text>
                <Text style={styles.summaryVal}>₪{deliveryFee.toFixed(2)}</Text>
              </View>
              <View
                style={[
                  styles.summaryRow,
                  { borderTopWidth: 1, borderColor: Colors.border, paddingTop: 6, marginTop: 4 },
                ]}
              >
                <Text style={[styles.summaryLabel, { fontWeight: '800', color: Colors.text }]}>Total</Text>
                <Text style={[styles.summaryVal, { fontWeight: '900', color: Colors.primaryLight, fontSize: 16 }]}>
                  ₪{grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btnPlaceOrder, isPlacingOrder && { opacity: 0.7 }]}
              onPress={handleCheckout}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPlaceOrderText}>🚀 Confirm Order & Pay ₪{grandTotal.toFixed(2)}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={() => setShowCheckout(false)}>
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
  woltBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 194, 232, 0.12)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 194, 232, 0.3)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  woltTitle: { fontSize: 13, fontWeight: '800', color: Colors.woltBlue },
  speedBadge: {
    backgroundColor: Colors.woltBlue,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  speedBadgeText: { color: '#0f172a', fontSize: 9, fontWeight: '900' },
  woltSub: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 13, marginRight: 6 },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.text,
    fontSize: 12,
  },
  searchClear: { color: Colors.textMuted, fontSize: 13, padding: 4 },
  storeRadarCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm + 2,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.25)',
  },
  radarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  radarDotPulse: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  radarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryLight,
  },
  radarTitle: { fontSize: 12, fontWeight: '800', color: Colors.text },
  radarSub: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  btnOpenAllMaps: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  btnOpenAllMapsText: { fontSize: 10, fontWeight: '700', color: Colors.primaryLight },
  storeChipsRow: {
    flexDirection: 'row',
    marginTop: Spacing.xs + 2,
  },
  storeChip: {
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeChipActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    borderColor: Colors.primaryLight,
  },
  storeChipText: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  storeChipTextActive: { color: Colors.primaryLight, fontWeight: '800' },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    marginTop: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: Colors.surfaceCard,
  },
  filterPillActive: { backgroundColor: Colors.primaryGlow },
  filterPillText: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  filterPillTextActive: { color: Colors.primaryLight, fontWeight: '800' },
  catalogScroll: { flex: 1 },
  catalogContent: { padding: Spacing.md, paddingBottom: 80 },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm + 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  emergencyPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.dangerGlow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  emergencyPillText: { color: Colors.dangerLight, fontSize: 9, fontWeight: '900' },
  productName: { fontSize: 14, fontWeight: '800', color: Colors.text },
  storeName: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  priceText: { fontSize: 16, fontWeight: '900', color: Colors.primaryLight, marginLeft: 8 },
  productActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  woltBadge: {
    backgroundColor: 'rgba(0, 194, 232, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  woltBadgeText: { color: Colors.woltBlue, fontSize: 10, fontWeight: '700' },
  btnAddCart: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnAddCartText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  qtyControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  qtyBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  qtyValue: { color: Colors.text, fontSize: 12, fontWeight: '800', paddingHorizontal: 6 },
  cartBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  cartItemCount: { fontSize: 11, color: Colors.textMuted },
  cartTotalPrice: { fontSize: 16, fontWeight: '900', color: Colors.text },
  btnCheckout: {
    backgroundColor: Colors.woltBlue,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  btnCheckoutText: { color: '#0f172a', fontSize: 12, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
  },
  modalHeading: { fontSize: 17, fontWeight: '900', color: Colors.text, marginBottom: Spacing.md },
  deliveryModeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  deliveryModeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surfaceCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deliveryModeBtnActive: { borderColor: Colors.primaryLight },
  deliveryModeText: { fontSize: 11, fontWeight: '700', color: Colors.textMuted },
  inputLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 4 },
  textInput: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
    padding: 10,
    color: Colors.text,
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  summaryBox: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 12,
    padding: 10,
    marginVertical: Spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  summaryLabel: { fontSize: 11, color: Colors.textMuted },
  summaryVal: { fontSize: 12, color: Colors.text, fontWeight: '700' },
  btnPlaceOrder: {
    backgroundColor: Colors.woltBlue,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  btnPlaceOrderText: { color: '#0f172a', fontSize: 13, fontWeight: '900' },
  btnCancel: { paddingVertical: 10, marginTop: 4 },
});
