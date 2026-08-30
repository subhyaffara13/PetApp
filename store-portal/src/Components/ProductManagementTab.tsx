import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, CheckCircle2, XCircle } from 'lucide-react';
import { ProductEditModal } from './ProductEditModal';
import './ProductManagementTab.css';

interface ProductManagementTabProps {
  storeId: string;
  apiUrl: string;
}

export const ProductManagementTab: React.FC<ProductManagementTabProps> = ({ storeId, apiUrl }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${apiUrl}/store-portal/${storeId}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  const constId = (p: any) => p?._id || p?.id;

  const handleToggleStock = async (product: any) => {
    const id = constId(product);
    const updated = !product.inStock;
    try {
      await axios.patch(`${apiUrl}/store-portal/${storeId}/products/${id}`, { inStock: updated });
      setProducts((prev) => prev.map((p) => (constId(p) === id ? { ...p, inStock: updated } : p)));
    } catch (err) {
      console.error('Failed to toggle stock', err);
    }
  };

  const handleSaveProduct = async (data: any) => {
    try {
      if (editingProduct) {
        await axios.patch(`${apiUrl}/store-portal/${storeId}/products/${constId(editingProduct)}`, data);
      } else {
        await axios.post(`${apiUrl}/store-portal/${storeId}/products`, data);
      }
      fetchProducts();
      setEditingProduct(null);
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to save product', err);
    }
  };

  return (
    <div className="product-management-container">
      <div className="product-mgmt-header">
        <div>
          <h2>📦 Catalog & Product Inventory</h2>
          <p>Control items, prices, stock availability, and tags for your store listing.</p>
        </div>
        <button className="btn-add-product" onClick={() => setShowAddModal(true)}>
          <Plus size={15} /> Add New Product
        </button>
      </div>

      <div className="product-catalog-grid">
        {products.map((prod) => (
          <div key={constId(prod)} className="catalog-product-card">
            <img src={prod.imageUrl} alt={prod.name} className="product-thumb" />
            <div className="product-card-body">
              <div className="product-tag-row">
                <span className="category-pill">{prod.category}</span>
                <span className="price-tag">₪{prod.price}</span>
              </div>
              <h4 className="product-name">{prod.name}</h4>
              <div className="product-actions-bar">
                <button
                  type="button"
                  className={`stock-badge ${prod.inStock ? 'in-stock' : 'out-of-stock'}`}
                  onClick={() => handleToggleStock(prod)}
                >
                  {prod.inStock ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {prod.inStock ? 'In Stock' : 'Out of Stock'}
                </button>
                <button
                  type="button"
                  className="btn-edit-prod"
                  onClick={() => setEditingProduct(prod)}
                >
                  <Edit2 size={13} /> Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingProduct) && (
        <ProductEditModal
          product={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};
