import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Package, RotateCcw, Calendar, FileText } from 'lucide-react';
import { DigitalReceiptModal } from '../DigitalReceiptModal/DigitalReceiptModal';
import type { ReceiptData } from '../DigitalReceiptModal/DigitalReceiptModal';
import './PastOrdersDrawer.css';

interface PastOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiUrl: string;
  onReorder: (items: any[]) => void;
}

export const PastOrdersDrawer: React.FC<PastOrdersDrawerProps> = ({
  isOpen,
  onClose,
  apiUrl,
  onReorder,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    if (isOpen) {
      axios.get(`${apiUrl}/marketplace/orders?customerId=default`).then((res) => {
        if (Array.isArray(res.data)) setOrders(res.data);
      }).catch(() => {
        setOrders([]);
      });
    }
  }, [isOpen, apiUrl]);

  if (!isOpen) return null;

  return (
    <div className="past-orders-overlay" onClick={onClose}>
      <div className="past-orders-drawer animate-slide-right" onClick={(e) => e.stopPropagation()}>
        <div className="past-orders-header">
          <div className="past-orders-title">
            <Package size={20} color="#38bdf8" />
            <h3>My Past Orders ({orders.length})</h3>
          </div>
          <button type="button" className="btn-close-drawer" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="past-orders-body">
          {orders.length === 0 ? (
            <div className="past-orders-empty">
              <Package size={40} color="#64748b" />
              <p>No past orders found.</p>
              <small>When you order pet food or supplies, your order receipts will be stored here for instant 1-click reordering.</small>
            </div>
          ) : (
            <div className="past-orders-list">
              {orders.map((ord) => {
                const isDelivered = ord.status === 'delivered';
                return (
                  <div key={ord._id} className="past-order-card">
                    <div className="past-order-card-header">
                      <div>
                        <strong>#{ord._id.slice(-5).toUpperCase()}</strong>
                        <small><Calendar size={11} /> {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}</small>
                      </div>
                      <span className={`order-status-badge ${isDelivered ? 'badge-delivered' : 'badge-pending'}`}>
                        {ord.status || 'Active'}
                      </span>
                    </div>

                    <div className="past-order-items-list">
                      {(ord.items || []).map((it: any, idx: number) => (
                        <div key={idx} className="past-order-item-row">
                          <span>{it.quantity}x {it.productName || it.productId}</span>
                          <strong>₪{(it.priceAtPurchase * it.quantity).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="past-order-footer">
                      <div className="past-order-total">
                        <small>Total Paid:</small>
                        <strong>₪{ord.total?.toFixed(2) || '0.00'}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn-view-receipt-order"
                          style={{
                            background: '#1e293b',
                            border: '1px solid #475569',
                            color: '#94a3b8',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                          onClick={() => {
                            setSelectedReceipt({
                              orderId: ord._id,
                              date: ord.createdAt || new Date().toISOString(),
                              storeName: 'PetSOS Marketplace',
                              deliveryAddress: undefined,
                              deliveryMode: 'delivery',
                              items: (ord.items || []).map((i: any) => ({
                                productName: i.productName || i.productId,
                                quantity: i.quantity,
                                unitPrice: i.priceAtPurchase,
                              })),
                              subtotal: ord.subtotal || 0,
                              deliveryFee: 0,
                              serviceFee: ord.serviceFee || 0,
                              total: ord.total || 0,
                              paymentMethod: ord.paymentStatus === 'captured' ? 'Card' : 'Pending',
                            });
                          }}
                        >
                          <FileText size={12} /> צפה בקבלה
                        </button>
                        <button
                          type="button"
                          className="btn-1click-reorder"
                          onClick={() => {
                            onReorder((ord.items || []).map((i: any) => ({
                              productId: i.productId,
                              productName: i.productName || i.productId,
                              quantity: i.quantity,
                              unitPrice: i.priceAtPurchase,
                              storeId: ord.shopId,
                            })));
                            onClose();
                          }}
                        >
                          <RotateCcw size={13} /> 1-Click Reorder
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedReceipt && (
        <DigitalReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};
