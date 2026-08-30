import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAudioAlert } from './Hooks/useAudioAlert';
import { useWakeLock } from './Hooks/useWakeLock';
import { useRegisterSW } from './useRegisterSW';
import { KanbanBoard } from './Components/KanbanBoard';
import { StoreClaimModal } from './Components/StoreClaimModal';
import { ProductManagementTab } from './Components/ProductManagementTab';
import { FinancialReportsTab } from './Components/FinancialReportsTab';
import { StoreCommunityTab } from './Components/StoreCommunityTab';
import { StoreLogin, loadStoreAuth, type StoreUser } from './Components/StoreLogin/StoreLogin';
import { Bell, Flame, RefreshCw, Sun, LayoutGrid, Package, TrendingUp, Sparkles } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export default function App() {
  useRegisterSW();
  const [storeUser, setStoreUser] = useState<StoreUser | null>(() => loadStoreAuth());
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'reports' | 'community'>('community');
  const [stores, setStores] = useState<any[]>([]);
  const [currentStore, setCurrentStore] = useState<any>({
    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
    name: 'Carmel Pet Supplies & Premium Nutrition',
    isClaimed: true,
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [isRushMode, setIsRushMode] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const hasIncoming = orders.some((o) => o.subOrder.status === 'awaiting_store_acceptance');
  useAudioAlert(hasIncoming);
  const isScreenAwake = useWakeLock();

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_URL}/stores/claimable`);
      if (Array.isArray(res.data) && res.data.length > 0) setStores(res.data);
    } catch {}
  };

  const fetchLiveOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/store-portal/orders/live?storeId=${currentStore._id}`);
      if (Array.isArray(res.data)) setOrders(res.data);
    } catch {}
  }, [currentStore._id]);

  useEffect(() => {
    fetchStores();
    fetchLiveOrders();
    const socket = io(SOCKET_URL);
    socket.emit('join:store', currentStore._id);
    socket.on('NEW_ORDER_ALERT', () => fetchLiveOrders());
    socket.on('ORDER_STATUS_CHANGED', () => fetchLiveOrders());
    const interval = setInterval(fetchLiveOrders, 8000);
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [currentStore._id, fetchLiveOrders]);

  const handleAction = async (masterOrderId: string, subOrderId: string, action: string, prepMinutes?: number) => {
    try {
      await axios.patch(`${API_URL}/store-portal/orders/${masterOrderId}/sub-orders/${subOrderId}/action`, {
        action,
        prepMinutes,
      });
      fetchLiveOrders();
    } catch {}
  };

  const handleToggleRushMode = async () => {
    const next = !isRushMode;
    setIsRushMode(next);
    try {
      await axios.patch(`${API_URL}/store-portal/settings/busy-mode`, { storeId: currentStore._id, isBusyMode: next });
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('petsos_store_auth_v1');
    setStoreUser(null);
  };

  if (!storeUser) {
    return <StoreLogin onLogin={(user) => setStoreUser(user)} />;
  }

  return (
    <div className="merchant-app-container">
      <header className="merchant-header-bar">
        <div className="merchant-header-left">
          <div>
            <div className="merchant-store-badge">
              🏪 {currentStore.name}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  borderRadius: 4,
                  padding: '2px 6px',
                  cursor: 'pointer',
                  marginLeft: '0.5rem',
                }}
              >
                Logout ({storeUser.name})
              </button>
            </div>
            <button className="btn-switch-store" onClick={() => setShowClaimModal(true)}>Switch / Claim Store Listing</button>
          </div>
          <span className={`merchant-pill ${isScreenAwake ? 'merchant-pill--active' : ''}`}><Sun size={12} /> {isScreenAwake ? 'Screen Awake' : 'Screen Timeout'}</span>
          {hasIncoming && <span className="merchant-pill merchant-pill--flashing"><Bell size={12} /> Incoming Orders</span>}
        </div>
        <div className="merchant-header-right">
          <div className="merchant-nav-tabs">
            <button className={`btn-nav-tab ${activeTab === 'community' ? 'btn-nav-tab--active' : ''}`} onClick={() => setActiveTab('community')}>
              <Sparkles size={13} /> Community & Promos
            </button>
            <button className={`btn-nav-tab ${activeTab === 'orders' ? 'btn-nav-tab--active' : ''}`} onClick={() => setActiveTab('orders')}>
              <LayoutGrid size={13} /> Live Orders
            </button>
            <button className={`btn-nav-tab ${activeTab === 'products' ? 'btn-nav-tab--active' : ''}`} onClick={() => setActiveTab('products')}>
              <Package size={13} /> Catalog / Inventory
            </button>
            <button className={`btn-nav-tab ${activeTab === 'reports' ? 'btn-nav-tab--active' : ''}`} onClick={() => setActiveTab('reports')}>
              <TrendingUp size={13} /> Reports & Accounting
            </button>
          </div>
          {activeTab === 'orders' && (
            <>
              <button className={`btn-rush-mode ${isRushMode ? 'btn-rush-mode--active' : ''}`} onClick={handleToggleRushMode}><Flame size={13} /> {isRushMode ? 'Rush ON' : 'Open'}</button>
            </>
          )}
          <button className="btn-refresh-orders" onClick={fetchLiveOrders}><RefreshCw size={13} /></button>
        </div>
      </header>

      {activeTab === 'community' ? (
        <StoreCommunityTab store={currentStore} />
      ) : activeTab === 'orders' ? (
        <KanbanBoard orders={orders} onAction={handleAction} />
      ) : activeTab === 'products' ? (
        <ProductManagementTab storeId={currentStore._id} apiUrl={API_URL} />
      ) : (
        <FinancialReportsTab storeId={currentStore._id} storeName={currentStore.name} apiUrl={API_URL} />
      )}

      {showClaimModal && (
        <StoreClaimModal
          stores={stores}
          currentStoreId={currentStore._id}
          apiUrl={API_URL}
          onSelectStore={(s) => { setCurrentStore(s); setShowClaimModal(false); }}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  );
}
