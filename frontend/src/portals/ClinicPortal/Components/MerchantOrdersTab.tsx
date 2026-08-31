import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAudioAlert } from '../Hooks/useAudioAlert';
import { useWakeLock } from '../Hooks/useWakeLock';
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Package,
  Phone,
  RefreshCw,
  Sun,
  Truck,
  User,
} from 'lucide-react';
import './MerchantOrdersTab.css';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface MerchantOrder {
  masterOrderId: string;
  deliveryAddress: { street: string; city: string; notes?: string };
  subOrder: {
    _id: string;
    storeId: string;
    status: string;
    items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; isEmergencyItem: boolean }>;
    subtotalAmount: number;
    deliveryFee: number;
    targetPrepMinutes?: number;
    prepStartedAt?: string;
    dispatchInfo?: {
      provider: string;
      courierName?: string;
      courierPhone?: string;
      trackingUrl?: string;
      pickupWindowStart?: string;
    };
    createdAt: string;
  };
}

interface MerchantOrdersTabProps {
  storeId?: string;
  storeName?: string;
}

export const MerchantOrdersTab: React.FC<MerchantOrdersTabProps> = ({
  storeId = '64f1a2b3c4d5e6f7a8b9c0d1',
  storeName = 'PetSOS Central Pharmacy & Meds',
}) => {
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [isRushMode, setIsRushMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const hasIncoming = orders.some((o) => o.subOrder.status === 'awaiting_store_acceptance');
  useAudioAlert(hasIncoming);
  const isScreenAwake = useWakeLock();

  const fetchLiveOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/store-portal/orders/live?storeId=${storeId}`);
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchLiveOrders();

    const socket = io(SOCKET_SERVER_URL);
    socket.emit('join:store', storeId);

    socket.on('NEW_ORDER_ALERT', () => fetchLiveOrders());
    socket.on('ORDER_STATUS_CHANGED', () => fetchLiveOrders());

    const interval = setInterval(fetchLiveOrders, 8000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [storeId]);

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
      await axios.patch(`${API_URL}/store-portal/settings/busy-mode`, {
        storeId,
        isBusyMode: next,
      });
    } catch {}
  };

  // Group columns
  const incoming = orders.filter((o) => o.subOrder.status === 'awaiting_store_acceptance');
  const inPrep = orders.filter((o) => o.subOrder.status === 'store_preparing');
  const outForDelivery = orders.filter(
    (o) =>
      o.subOrder.status === 'ready_for_pickup' ||
      o.subOrder.status === 'courier_assigned' ||
      o.subOrder.status === 'out_for_delivery'
  );
  const completed = orders.filter((o) => o.subOrder.status === 'delivered');

  return (
    <div className="merchant-app-container">
      {/* Top Tablet Control Bar */}
      <header className="merchant-header-bar">
        <div className="merchant-header-left">
          <div className="merchant-store-info">
            <span className="merchant-store-badge">🏪 {storeName}</span>
            <span className="merchant-store-sub">DaaS On-Demand Fulfillment (Wolt Drive / Uber Direct)</span>
          </div>

          <div className="merchant-pills-row">
            <span className={`merchant-pill ${isScreenAwake ? 'merchant-pill--active' : ''}`}>
              <Sun size={13} /> {isScreenAwake ? 'Screen Awake' : 'Screen Timeout'}
            </span>
            {hasIncoming && (
              <span className="merchant-pill merchant-pill--flashing">
                <Bell size={13} className="animate-wiggle" /> {incoming.length} Needs Acceptance
              </span>
            )}
          </div>
        </div>

        <div className="merchant-header-right">
          <button
            type="button"
            className={`btn-rush-mode ${isRushMode ? 'btn-rush-mode--active' : ''}`}
            onClick={handleToggleRushMode}
          >
            <Flame size={15} /> {isRushMode ? 'Rush Mode ON (+₪10/Paused)' : 'Normal Rush (Open)'}
          </button>
          <button type="button" className="btn-refresh-orders" onClick={fetchLiveOrders} title="Refresh Live Orders">
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* 4-Column High-Contrast Tablet Kanban Board */}
      <div className="merchant-kanban-board">
        {/* Column 1: Incoming Orders (Flashing & Audio Alert) */}
        <section className="kanban-column kanban-column--incoming">
          <div className="kanban-col-title">
            <h3>🚨 1. Needs Action ({incoming.length})</h3>
            <small>Accept or Decline</small>
          </div>

          <div className="kanban-cards-scroll">
            {incoming.length === 0 ? (
              <div className="kanban-empty-slot">
                <CheckCircle2 size={32} color="#10b981" />
                <p>All incoming orders accepted</p>
                <small>Waiting for new customer checkouts...</small>
              </div>
            ) : (
              incoming.map(({ masterOrderId, subOrder, deliveryAddress }) => {
                const hasEmergency = subOrder.items.some((i) => i.isEmergencyItem);

                return (
                  <article
                    key={subOrder._id}
                    className={`merchant-order-card card-incoming ${hasEmergency ? 'card-emergency-flash' : ''}`}
                  >
                    <div className="order-card-header">
                      <span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span>
                      {hasEmergency && <span className="sos-pill-badge">🚨 EMERGENCY MEDS</span>}
                      <span className="order-total-pill">₪{subOrder.subtotalAmount + subOrder.deliveryFee}</span>
                    </div>

                    <div className="order-address-box">
                      📍 <strong>{deliveryAddress.street}, {deliveryAddress.city}</strong>
                      {deliveryAddress.notes && <span className="address-note">{deliveryAddress.notes}</span>}
                    </div>

                    <div className="order-items-box">
                      <label>Items ({subOrder.items.length}):</label>
                      <ul>
                        {subOrder.items.map((it, idx) => (
                          <li key={idx}>
                            <strong>{it.quantity}x</strong> {it.productName}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="order-action-buttons-grid">
                      <button
                        type="button"
                        className="btn-action-accept btn-accept-15"
                        onClick={() => handleAction(masterOrderId, subOrder._id, 'accept', 15)}
                      >
                        Accept (15 min)
                      </button>
                      <button
                        type="button"
                        className="btn-action-accept btn-accept-30"
                        onClick={() => handleAction(masterOrderId, subOrder._id, 'accept', 30)}
                      >
                        Accept (30 min)
                      </button>
                      <button
                        type="button"
                        className="btn-action-decline"
                        onClick={() => handleAction(masterOrderId, subOrder._id, 'decline')}
                      >
                        Decline
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Column 2: In Preparation Checklist */}
        <section className="kanban-column kanban-column--prep">
          <div className="kanban-col-title">
            <h3>🍳 2. In Prep ({inPrep.length})</h3>
            <small>Packing checklist & dispatch</small>
          </div>

          <div className="kanban-cards-scroll">
            {inPrep.length === 0 ? (
              <div className="kanban-empty-slot">
                <Package size={32} color="#64748b" />
                <p>No orders currently packing</p>
              </div>
            ) : (
              inPrep.map(({ masterOrderId, subOrder }) => (
                <article key={subOrder._id} className="merchant-order-card card-prep">
                  <div className="order-card-header">
                    <span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span>
                    <span className="prep-target-tag">
                      <Clock size={12} /> Target: {subOrder.targetPrepMinutes || 15}m
                    </span>
                  </div>

                  <div className="packing-checklist-box">
                    <label className="checklist-heading">Packing Checklist:</label>
                    {subOrder.items.map((it, idx) => {
                      const key = `${subOrder._id}_${idx}`;
                      return (
                        <label key={idx} className="checklist-item-row">
                          <input
                            type="checkbox"
                            checked={!!checkedItems[key]}
                            onChange={(e) => setCheckedItems({ ...checkedItems, [key]: e.target.checked })}
                          />
                          <span>
                            <strong>{it.quantity}x</strong> {it.productName}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    className="btn-ready-dispatch-now"
                    onClick={() => handleAction(masterOrderId, subOrder._id, 'ready_for_pickup')}
                  >
                    🚀 Ready for Pickup (Dispatch DaaS Courier)
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Column 3: Out for Delivery & Courier Status */}
        <section className="kanban-column kanban-column--courier">
          <div className="kanban-col-title">
            <h3>🛵 3. Courier & En Route ({outForDelivery.length})</h3>
            <small>Live DaaS Tracking</small>
          </div>

          <div className="kanban-cards-scroll">
            {outForDelivery.length === 0 ? (
              <div className="kanban-empty-slot">
                <Truck size={32} color="#64748b" />
                <p>No couriers on road</p>
              </div>
            ) : (
              outForDelivery.map(({ subOrder }) => (
                <article key={subOrder._id} className="merchant-order-card card-courier">
                  <div className="order-card-header">
                    <span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span>
                    <span className="daas-provider-tag">
                      {subOrder.dispatchInfo?.provider === 'wolt_drive' ? '🔷 Wolt Drive' : '⬛ Uber Direct'}
                    </span>
                  </div>

                  <div className="courier-profile-card">
                    <div className="courier-name-row">
                      <User size={14} />
                      <strong>{subOrder.dispatchInfo?.courierName || 'Assigning nearest driver...'}</strong>
                    </div>

                    {subOrder.dispatchInfo?.courierPhone && (
                      <div className="courier-phone-row">
                        <Phone size={13} />
                        <a href={`tel:${subOrder.dispatchInfo.courierPhone}`}>
                          {subOrder.dispatchInfo.courierPhone}
                        </a>
                      </div>
                    )}

                    {subOrder.dispatchInfo?.trackingUrl && (
                      <a
                        href={subOrder.dispatchInfo.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-open-live-gps"
                      >
                        <ExternalLink size={13} /> Open Live GPS Tracker
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Column 4: Completed / Shift Summary */}
        <section className="kanban-column kanban-column--completed">
          <div className="kanban-col-title">
            <h3>✅ 4. Completed ({completed.length})</h3>
            <small>Shift Fulfilled Log</small>
          </div>

          <div className="kanban-cards-scroll">
            {completed.length === 0 ? (
              <div className="kanban-empty-slot">
                <CheckCircle2 size={32} color="#64748b" />
                <p>Completed orders will appear here</p>
              </div>
            ) : (
              completed.map(({ subOrder }) => (
                <article key={subOrder._id} className="merchant-order-card card-completed">
                  <div className="order-card-header">
                    <span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span>
                    <span className="delivered-badge">DELIVERED</span>
                  </div>
                  <div className="completed-summary">
                    <span>{subOrder.items.length} items</span>
                    <strong>₪{subOrder.subtotalAmount.toFixed(2)}</strong>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
