import React, { useState } from 'react';
import { X, Check, Sliders, Sparkles } from 'lucide-react';
import './ProductEditModal.css';

interface ProductEditModalProps {
  product?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({ product, onSave, onClose }) => {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price || 150);
  const [category, setCategory] = useState(product?.category || 'Food');
  const [priority, setPriority] = useState<number>(product?.priority ?? 50);
  const [inStock, setInStock] = useState(product?.inStock !== false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name,
      price: Number(price),
      category,
      priority: Number(priority),
      inStock,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
    });
  };

  return (
    <div className="store-modal-overlay" onClick={onClose}>
      <div className="store-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="store-modal-header">
          <div className="modal-title-group">
            <Sparkles size={18} color="#38bdf8" />
            <h3>{product ? 'Edit Catalog Product' : 'Add New Product'}</h3>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="product-modal-form">
          <div className="input-group">
            <label>Product Name</label>
            <input type="text" required placeholder="e.g. Royal Canin Maxi Adult 15kg" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-row-2">
            <div className="input-group">
              <label>Price (₪)</label>
              <input type="number" required min={1} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="input-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Food">🥩 Food & Nutrition</option>
                <option value="Appliances">📦 Appliances & Feeders</option>
                <option value="Toys">🎾 Toys & Chews</option>
                <option value="Care">🧴 Grooming & Care</option>
              </select>
            </div>
          </div>

          {/* Catalog Inventory Display Priority Slider */}
          <div className="input-group slider-group">
            <div className="slider-label-row">
              <label><Sliders size={13} /> Menu Display Ranking (Position: {priority})</label>
              <span className="priority-badge">{priority > 75 ? '🔥 Featured / Top' : priority > 35 ? '⭐ Standard' : '📦 Bottom'}</span>
            </div>
            <input type="range" min={1} max={100} value={priority} onChange={(e) => setPriority(Number(e.target.value))} className="priority-range-slider" />
          </div>

          <div className="input-group">
            <label>Image URL</label>
            <input type="url" placeholder="https://images.unsplash.com/..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>

          <div className="stock-toggle-box">
            <input type="checkbox" id="stockToggle" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
            <label htmlFor="stockToggle">In Stock & Accepting Instant Orders</label>
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save-prod"><Check size={14} /> Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
};
