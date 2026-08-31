import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Colors, Spacing, Typography } from '../../theme/theme';
import { useAuth } from '../../context/AuthContext';

interface StoreOrder {
  id: string;
  pin: string;
  customerName: string;
  deliveryMode: 'wolt' | 'pickup';
  status: 'incoming' | 'prep' | 'courier' | 'delivered';
  address: string;
  items: Array<{ name: string; qty: number; checked: boolean }>;
  total: number;
}

const INITIAL_ORDERS: StoreOrder[] = [
  {
    id: 'ord_1',
    pin: '#E91A4',
    customerName: 'Maya Cohen',
    deliveryMode: 'wolt',
    status: 'incoming',
    address: 'HaNassi Ave 42, Apt 5, Haifa',
    items: [
      { name: 'Royal Canin Veterinary Diet Gastrointestinal 2kg', qty: 1, checked: false },
      { name: 'Wound Care Sterile Bandage Kit', qty: 2, checked: false },
    ],
    total: 233,
  },
  {
    id: 'ord_2',
    pin: '#B82C1',
    customerName: 'Yossi Dan',
    deliveryMode: 'pickup',
    status: 'prep',
    address: 'Counter Pickup (In-Store)',
    items: [{ name: 'Bravecto Chewable Prevention Dogs 20-40kg', qty: 1, checked: true }],
    total: 189,
  },
  {
    id: 'ord_3',
    pin: '#A49F1',
    customerName: 'Subhy Affara',
    deliveryMode: 'wolt',
    status: 'courier',
    address: 'Bat Galim Promenade 18, Haifa',
    items: [{ name: 'Orijen Original Dog Food 11.4kg', qty: 1, checked: true }],
    total: 389,
  },
];

export const StorePortalScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StoreOrder[]>(INITIAL_ORDERS);
  const [activeStage, setActiveStage] = useState<'incoming' | 'prep' | 'courier' | 'catalog'>('incoming');

  // Inventory sample
  const [inventory, setInventory] = useState([
    { id: 'inv_1', name: 'Royal Canin Gastrointestinal 2kg', inStock: true, price: 135 },
    { id: 'inv_2', name: 'Bravecto Dogs 20-40kg', inStock: true, price: 189 },
    { id: 'inv_3', name: 'Sterile Wound Bandage Kit', inStock: true, price: 49 },
    { id: 'inv_4', name: 'Orijen Original 11.4kg', inStock: false, price: 389 },
  ]);

  const handleAdvanceStage = (orderId: string, nextStatus: 'prep' | 'courier' | 'delivered') => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    if (nextStatus === 'prep') {
      Alert.alert('🍳 Order In Preparation', 'Moved to packing checklist stage.');
    } else if (nextStatus === 'courier') {
      Alert.alert('🔷 Wolt Courier Dispatched!', 'Wolt driver assigned and en route to store.');
    }
  };

  const handleToggleItemCheck = (orderId: string, itemIdx: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextItems = [...o.items];
          nextItems[itemIdx].checked = !nextItems[itemIdx].checked;
          return { ...o, items: nextItems };
        }
        return o;
      })
    );
  };

  const filteredOrders = orders.filter((o) => o.status === activeStage);

  return (
    <View style={styles.container}>
      {/* Store Sub-Header */}
      <View style={styles.headerBanner}>
        <View>
          <Text style={styles.bannerTitle}>🏪 Haifa Animal Supplies Hub</Text>
          <Text style={styles.bannerSub}>DaaS On-Demand Merchant Station · Wolt Integrated</Text>
        </View>
      </View>

      {/* Kanban Navigation Tabs */}
      <View style={styles.stageTabs}>
        <TouchableOpacity
          style={[styles.stageTabBtn, activeStage === 'incoming' && styles.stageTabBtnActiveIncoming]}
          onPress={() => setActiveStage('incoming')}
        >
          <Text style={[styles.stageTabText, activeStage === 'incoming' && styles.stageTabTextActive]}>
            🚨 Incoming ({orders.filter((o) => o.status === 'incoming').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stageTabBtn, activeStage === 'prep' && styles.stageTabBtnActive]}
          onPress={() => setActiveStage('prep')}
        >
          <Text style={[styles.stageTabText, activeStage === 'prep' && styles.stageTabTextActive]}>
            🍳 In Prep ({orders.filter((o) => o.status === 'prep').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stageTabBtn, activeStage === 'courier' && styles.stageTabBtnActiveWolt]}
          onPress={() => setActiveStage('courier')}
        >
          <Text style={[styles.stageTabText, activeStage === 'courier' && styles.stageTabTextActiveWolt]}>
            🛵 Wolt/Pickup ({orders.filter((o) => o.status === 'courier').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.stageTabBtn, activeStage === 'catalog' && styles.stageTabBtnActive]}
          onPress={() => setActiveStage('catalog')}
        >
          <Text style={[styles.stageTabText, activeStage === 'catalog' && styles.stageTabTextActive]}>
            🏷️ Stock
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {activeStage !== 'catalog' ? (
          filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={{ fontSize: 30 }}>📦</Text>
              <Text style={styles.emptyTitle}>No orders in this stage</Text>
            </View>
          ) : (
            filteredOrders.map((order) => {
              const isWolt = order.deliveryMode === 'wolt';

              return (
                <View key={order.id} style={styles.orderCard}>
                  {/* Top Order Row */}
                  <View style={styles.orderHeaderRow}>
                    <View>
                      <Text style={styles.customerName}>{order.customerName}</Text>
                      <Text style={styles.addressText}>📍 {order.address}</Text>
                    </View>
                    <View style={[styles.modeBadge, isWolt ? styles.modeWolt : styles.modePickup]}>
                      <Text style={styles.modeBadgeText}>
                        {isWolt ? '🔷 Wolt Drive' : '🛍️ Counter Pickup'}
                      </Text>
                    </View>
                  </View>

                  {/* Prominent Courier Verification PIN */}
                  <View style={styles.pinHandoffBox}>
                    <View>
                      <Text style={styles.pinBoxLabel}>📦 Courier Verification PIN:</Text>
                      <Text style={styles.pinBoxVal}>{order.pin}</Text>
                    </View>
                    <Text style={styles.pinSubLabel}>Wolt Pickup ID</Text>
                  </View>

                  {/* Packing Checklist */}
                  <View style={styles.packingBox}>
                    <Text style={styles.packingTitle}>Packing Checklist:</Text>
                    {order.items.map((it, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.checkItemRow}
                        onPress={() => handleToggleItemCheck(order.id, idx)}
                      >
                        <Text style={styles.checkboxIcon}>{it.checked ? '☑️' : '⬜'}</Text>
                        <Text style={[styles.checkItemText, it.checked && styles.checkItemTextDone]}>
                          {it.qty}x {it.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Stage Advance Buttons */}
                  {order.status === 'incoming' && (
                    <TouchableOpacity
                      style={styles.btnAcceptOrder}
                      onPress={() => handleAdvanceStage(order.id, 'prep')}
                    >
                      <Text style={styles.btnAcceptOrderText}>🍳 Accept & Start Prepping</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'prep' && (
                    <TouchableOpacity
                      style={styles.btnDispatchWolt}
                      onPress={() => handleAdvanceStage(order.id, 'courier')}
                    >
                      <Text style={styles.btnDispatchWoltText}>
                        {isWolt ? '🚀 Ready for Pickup (Dispatch Wolt DaaS)' : '🛍️ Ready for Customer Pickup'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {order.status === 'courier' && (
                    <TouchableOpacity
                      style={styles.btnDeliveredDone}
                      onPress={() => handleAdvanceStage(order.id, 'delivered')}
                    >
                      <Text style={styles.btnDeliveredDoneText}>✓ Complete Order</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )
        ) : (
          /* TAB 4: STORE INVENTORY */
          <View>
            <View style={styles.stockHeaderCard}>
              <Text style={styles.stockTitle}>🏷️ Quick Inventory Stock Controls</Text>
              <Text style={styles.stockSub}>Toggle out-of-stock items instantly across the mobile marketplace</Text>
            </View>

            {inventory.map((inv) => (
              <View key={inv.id} style={styles.invCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.invName}>{inv.name}</Text>
                  <Text style={styles.invPrice}>₪{inv.price}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={[styles.stockStatusText, { color: inv.inStock ? Colors.successLight : Colors.dangerLight }]}>
                    {inv.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                  </Text>
                  <Switch
                    value={inv.inStock}
                    onValueChange={(val) =>
                      setInventory((prev) =>
                        prev.map((i) => (i.id === inv.id ? { ...i, inStock: val } : i))
                      )
                    }
                    trackColor={{ false: '#334155', true: Colors.success }}
                    thumbColor="#fff"
                  />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerBanner: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bannerTitle: { fontSize: 13, fontWeight: '900', color: Colors.warningLight },
  bannerSub: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  stageTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  stageTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  stageTabBtnActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  stageTabBtnActiveIncoming: { backgroundColor: Colors.dangerGlow },
  stageTabBtnActiveWolt: { backgroundColor: 'rgba(0, 194, 232, 0.15)' },
  stageTabText: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  stageTabTextActive: { color: Colors.text, fontWeight: '900' },
  stageTabTextActiveWolt: { color: Colors.woltBlue, fontWeight: '900' },
  scrollArea: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 24 },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  customerName: { fontSize: 15, fontWeight: '900', color: Colors.text },
  addressText: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  modeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  modeWolt: { backgroundColor: 'rgba(0, 194, 232, 0.15)' },
  modePickup: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  modeBadgeText: { fontSize: 9, fontWeight: '900', color: Colors.textSecondary },
  pinHandoffBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 10,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.warning,
    marginVertical: 6,
  },
  pinBoxLabel: { fontSize: 9, fontWeight: '800', color: Colors.warningLight },
  pinBoxVal: { fontSize: 15, fontWeight: '900', color: '#fff', fontFamily: 'monospace', marginTop: 1 },
  pinSubLabel: { fontSize: 9, color: Colors.textMuted },
  packingBox: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 8,
    padding: 8,
    marginVertical: 6,
  },
  packingTitle: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, marginBottom: 4 },
  checkItemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 3 },
  checkboxIcon: { fontSize: 13 },
  checkItemText: { fontSize: 11, color: Colors.text, flex: 1 },
  checkItemTextDone: { textDecorationLine: 'line-through', color: Colors.textMuted },
  btnAcceptOrder: {
    backgroundColor: Colors.danger,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnAcceptOrderText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  btnDispatchWolt: {
    backgroundColor: Colors.woltBlue,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDispatchWoltText: { color: '#0f172a', fontSize: 11, fontWeight: '900' },
  btnDeliveredDone: {
    backgroundColor: Colors.success,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDeliveredDoneText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  emptyCard: { alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.surface, borderRadius: 16 },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: Colors.textMuted, marginTop: 6 },
  stockHeaderCard: {
    backgroundColor: Colors.surfaceCard,
    padding: 10,
    borderRadius: 10,
    marginBottom: Spacing.md,
  },
  stockTitle: { fontSize: 12, fontWeight: '800', color: Colors.text },
  stockSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  invCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  invName: { fontSize: 13, fontWeight: '800', color: Colors.text },
  invPrice: { fontSize: 12, color: Colors.primaryLight, fontWeight: '700', marginTop: 2 },
  stockStatusText: { fontSize: 9, fontWeight: '900' },
});
