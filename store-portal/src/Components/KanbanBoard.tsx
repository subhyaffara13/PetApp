import React, { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Package, Phone, Truck, User, Store } from 'lucide-react';

interface KanbanBoardProps {
  orders: any[];
  onAction: (masterOrderId: string, subOrderId: string, action: string, prepMinutes?: number) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ orders, onAction }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const incoming = orders.filter((o) => o.subOrder.status === 'awaiting_store_acceptance');
  const inPrep = orders.filter((o) => o.subOrder.status === 'store_preparing');
  const outForDelivery = orders.filter((o) => ['ready_for_pickup', 'courier_assigned', 'out_for_delivery'].includes(o.subOrder.status));
  const completed = orders.filter((o) => o.subOrder.status === 'delivered');

  return (
    <div className="merchant-kanban-board">
      {/* 1. Needs Action */}
      <section className="kanban-column kanban-column--incoming">
        <div className="kanban-col-title">
          <h3>🚨 1. Needs Action ({incoming.length})</h3>
          <small>Accept or Decline</small>
        </div>
        <div className="kanban-cards-scroll">
          {incoming.length === 0 ? (
            <div className="kanban-empty-slot"><CheckCircle2 size={28} color="#10b981" /><p>All orders accepted</p></div>
          ) : (
            incoming.map(({ masterOrderId, subOrder, deliveryAddress }) => (
              <article key={subOrder._id} className={`merchant-order-card card-incoming ${subOrder.items.some((i: any) => i.isEmergencyItem) ? 'card-emergency-flash' : ''}`}>
                <div className="order-card-header">
                  <span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span>
                  {subOrder.items.some((i: any) => i.isEmergencyItem) && <span className="sos-pill-badge">🚨 EMERGENCY</span>}
                  <span className="order-total-pill">₪{subOrder.subtotalAmount + subOrder.deliveryFee}</span>
                </div>
                <div className="order-address-box">📍 <strong>{deliveryAddress.street}, {deliveryAddress.city}</strong></div>
                <div className="order-items-box">
                  <ul>{subOrder.items.map((it: any, idx: number) => <li key={idx}><strong>{it.quantity}x</strong> {it.productName}</li>)}</ul>
                </div>
                <div className="order-action-buttons-grid">
                  <button className="btn-action-accept" onClick={() => onAction(masterOrderId, subOrder._id, 'accept', 15)}>Accept (15m)</button>
                  <button className="btn-action-accept" onClick={() => onAction(masterOrderId, subOrder._id, 'accept', 30)}>Accept (30m)</button>
                  <button className="btn-action-decline" onClick={() => onAction(masterOrderId, subOrder._id, 'decline')}>Decline</button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* 2. In Prep */}
      <section className="kanban-column kanban-column--prep">
        <div className="kanban-col-title">
          <h3>🍳 2. In Prep ({inPrep.length})</h3>
          <small>Packing & DaaS Dispatch</small>
        </div>
        <div className="kanban-cards-scroll">
          {inPrep.length === 0 ? (
            <div className="kanban-empty-slot"><Package size={28} color="#64748b" /><p>No orders in prep</p></div>
          ) : (
            inPrep.map(({ masterOrderId, subOrder }) => (
              <article key={subOrder._id} className="merchant-order-card card-prep">
                <div className="order-card-header">
                  <span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span>
                  <span className="prep-target-tag"><Clock size={12} /> Target: {subOrder.targetPrepMinutes || 15}m</span>
                </div>
                <div className="packing-checklist-box">
                  {subOrder.items.map((it: any, idx: number) => {
                    const key = `${subOrder._id}_${idx}`;
                    return (
                      <label key={idx} className="checklist-item-row">
                        <input type="checkbox" checked={!!checkedItems[key]} onChange={(e) => setCheckedItems({ ...checkedItems, [key]: e.target.checked })} />
                        <span><strong>{it.quantity}x</strong> {it.productName}</span>
                      </label>
                    );
                  })}
                </div>
                <button className="btn-ready-dispatch-now" onClick={() => onAction(masterOrderId, subOrder._id, 'ready_for_pickup')}>
                  {subOrder.deliveryMode === 'pickup' ? '🛍️ Ready for Counter Pickup' : '🚀 Ready for Pickup (Dispatch DaaS)'}
                </button>
              </article>
            ))
          )}
        </div>
      </section>

      {/* 3. On The Way */}
      <section className="kanban-column kanban-column--courier">
        <div className="kanban-col-title">
          <h3>🛵 3. Courier / Pickup ({outForDelivery.length})</h3>
          <small>Live Dispatch & Counter</small>
        </div>
        <div className="kanban-cards-scroll">
          {outForDelivery.length === 0 ? (
            <div className="kanban-empty-slot"><Truck size={28} color="#64748b" /><p>No active couriers/pickups</p></div>
          ) : (
            outForDelivery.map(({ masterOrderId, subOrder }) => {
              const isPickup = subOrder.deliveryMode === 'pickup';
              return (
                <article key={subOrder._id} className="merchant-order-card card-courier">
                  <div className="order-card-header">
                    <span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span>
                    <span className="daas-provider-tag" style={{ background: isPickup ? 'rgba(16, 185, 129, 0.2)' : undefined, color: isPickup ? '#10b981' : undefined }}>
                      {isPickup ? '🛍️ איסוף עצמי (Self Pickup)' : subOrder.dispatchInfo?.provider === 'wolt_drive' ? '🔷 Wolt Drive' : '⬛ Uber Direct'}
                    </span>
                  </div>

                  {isPickup ? (
                    <div className="courier-profile-card">
                      <div className="courier-name-row">
                        <Store size={13} color="#10b981" />
                        <strong>Customer Picking Up at Counter</strong>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.3rem 0 0.5rem' }}>
                        Customer has been notified that order is packaged and waiting at pickup counter.
                      </p>
                      <button
                        type="button"
                        onClick={() => onAction(masterOrderId, subOrder._id, 'simulate_delivered')}
                        style={{
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          padding: '0.5rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        🛍️ נאסף ע״י הלקוח (Collected)
                      </button>
                    </div>
                  ) : (
                    <div className="courier-profile-card">
                      <div className="courier-name-row"><User size={13} /> <strong>{subOrder.dispatchInfo?.courierName || 'Assigning nearest driver...'}</strong></div>
                      {subOrder.dispatchInfo?.courierPhone && <div className="courier-phone-row"><Phone size={12} /><a href={`tel:${subOrder.dispatchInfo.courierPhone}`}>{subOrder.dispatchInfo.courierPhone}</a></div>}
                      {subOrder.dispatchInfo?.trackingUrl && (
                        <a href={subOrder.dispatchInfo.trackingUrl} target="_blank" rel="noreferrer" className="btn-open-live-gps">
                          <ExternalLink size={12} /> Open Live GPS
                        </a>
                      )}
                      <div className="sim-buttons-row" style={{ display: 'flex', gap: '0.3rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={() => onAction(masterOrderId, subOrder._id, 'simulate_pickup')}
                          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          🛵 Picked Up
                        </button>
                        <button
                          type="button"
                          onClick={() => onAction(masterOrderId, subOrder._id, 'simulate_delivered')}
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.3rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          📦 Delivered
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      {/* 4. Completed */}
      <section className="kanban-column kanban-column--completed">
        <div className="kanban-col-title"><h3>✅ 4. Completed ({completed.length})</h3></div>
        <div className="kanban-cards-scroll">
          {completed.length === 0 ? <div className="kanban-empty-slot"><CheckCircle2 size={28} color="#64748b" /><p>No fulfilled orders yet</p></div> : (
            completed.map(({ subOrder }) => (
              <article key={subOrder._id} className="merchant-order-card card-completed">
                <div className="order-card-header"><span className="order-short-id">#{subOrder._id.slice(-5).toUpperCase()}</span><span className="delivered-badge">DELIVERED</span></div>
                <div className="completed-summary"><span>{subOrder.items.length} items</span><strong>₪{subOrder.subtotalAmount.toFixed(2)}</strong></div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
