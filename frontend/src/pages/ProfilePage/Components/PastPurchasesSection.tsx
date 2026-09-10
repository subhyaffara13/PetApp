import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';

interface PurchaseItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface PurchaseOrder {
  _id?: string;
  orderNumber?: string;
  shopId?: string;
  shopName?: string;
  items: PurchaseItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
  paymentMethod?: string;
  trackingNumber?: string;
  createdAt: string;
}

interface PastPurchasesSectionProps {
  userId?: string;
}

export const PastPurchasesSection: React.FC<PastPurchasesSectionProps> = ({ userId }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await axios.get<PurchaseOrder[]>(`${API_URL}/marketplace/orders/my-purchases`);
        if (Array.isArray(res.data)) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Failed to load past purchases', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [userId]);

  if (isLoading) {
    return (
      <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
        <p>Loading purchase history from Atlas...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div
        style={{
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          margin: '1rem 0',
        }}
      >
        <ShoppingBag size={42} style={{ color: '#64748b', marginBottom: '0.75rem' }} />
        <h3 style={{ color: '#f1f5f9', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
          No Purchases Yet
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
          Your verified pet pharmacy, food, and supplies orders will appear here with live tracking and tax receipts.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/marketplace')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.25rem', borderRadius: '12px' }}
        >
          <ShoppingBag size={16} /> Explore Pet Marketplace
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          padding: '0.85rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Package size={20} color="#38bdf8" />
          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>
            {orders.length} Past Order{orders.length > 1 ? 's' : ''} Preserved
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#38bdf8',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          Browse Shops <ExternalLink size={13} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map((order, idx) => {
          const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent';
          const orderNum = order.orderNumber || order._id?.slice(-8).toUpperCase() || `ORD-${1000 + idx}`;
          const isDelivered = order.status === 'delivered' || order.status === 'completed';

          return (
            <div
              key={order._id || idx}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.25rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {/* Top Row: Order Number, Date, Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.95rem' }}>
                    #{orderNum}
                  </span>
                  {order.shopName && (
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      · {order.shopName}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {dateStr}
                  </span>
                  <span
                    style={{
                      background: isDelivered ? 'rgba(34, 197, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: isDelivered ? '#4ade80' : '#38bdf8',
                      border: `1px solid ${isDelivered ? 'rgba(34, 197, 94, 0.35)' : 'rgba(56, 189, 248, 0.35)'}`,
                      padding: '0.15rem 0.55rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(order.items || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1' }}>
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Row: Payment & Total */}
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.78rem' }}>
                  <CreditCard size={14} />
                  <span>{order.paymentMethod || 'Stripe Card Payment'}</span>
                  {order.trackingNumber && (
                    <span style={{ marginLeft: '0.5rem', color: '#38bdf8' }}>
                      Track: {order.trackingNumber}
                    </span>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginRight: '0.4rem' }}>Total:</span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>
                    ${(order.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
