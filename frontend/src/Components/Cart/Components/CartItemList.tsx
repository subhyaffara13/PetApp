import React from 'react';
import { Minus, Plus } from 'lucide-react';
import type { CartItem } from '../../../schemas';

interface CartItemListProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export const CartItemList: React.FC<CartItemListProps> = ({
  items,
  onUpdateQuantity,
}) => {
  return (
    <div className="cart-drawer__items">
      {items.map((item) => (
        <div key={item.product._id} className="cart-item">
          <img
            src={item.product.imageUrl || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=100'}
            alt={item.product.name}
            className="cart-item__img"
          />
          <div className="cart-item__info">
            <h4 className="cart-item__name">{item.product.name}</h4>
            <span className="cart-item__price">₪{item.product.price}</span>
            <div className="cart-item__quantity">
              <button
                className="cart-qty-btn"
                onClick={() => onUpdateQuantity(item.product._id!, -1)}
                aria-label="Decrease quantity"
              >
                <Minus size={12} />
              </button>
              <span className="cart-qty-val">{item.quantity}</span>
              <button
                className="cart-qty-btn"
                onClick={() => onUpdateQuantity(item.product._id!, 1)}
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          <span className="cart-item__total">₪{(item.product.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};
