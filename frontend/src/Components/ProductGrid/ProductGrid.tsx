import type { Product } from '../../schemas';
import { Plus, Package, Heart } from 'lucide-react';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
}

export const ProductGrid = ({ products, onAddToCart, onToggleWishlist, wishlistIds = [] }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="product-grid-empty">
        <Package size={32} />
        <p>No products listed yet</p>
      </div>
    );
  }

  return (
    <div className="product-grid" id="product-grid">
      {products.map((product, i) => (
        <div
          key={product._id}
          className="product-item card animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className="product-item__image" style={{ width: '100%', height: 130, overflow: 'hidden', borderRadius: '8px 8px 0 0', background: '#1e293b' }}>
            <img
              src={
                product.imageUrl ||
                (product.category === 'Food'
                  ? 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=300'
                  : product.category === 'Appliances'
                  ? 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300'
                  : 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=300')
              }
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div className="product-item__info">
            <h4 className="product-item__name">{product.name}</h4>
            <p className="product-item__desc">{product.description}</p>
            <div className="product-item__footer">
              <span className="product-item__price">₪{product.price.toFixed(2)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {onToggleWishlist && (
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: product._id && wishlistIds.includes(product._id) ? '#ef4444' : 'var(--color-text-muted)',
                    }}
                    title="Add to Wishlist"
                  >
                    <Heart size={16} fill={product._id && wishlistIds.includes(product._id) ? '#ef4444' : 'none'} />
                  </button>
                )}
                {product.inStock ? (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onAddToCart(product)}
                  >
                    <Plus size={14} /> Add
                  </button>
                ) : (
                  <span className="badge badge-closed">Out of Stock</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
