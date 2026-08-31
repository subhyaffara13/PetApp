import { useState, useEffect } from 'react';
import axios from 'axios';
import { Cart } from '../../Components/Cart/Cart';
import { MarketplaceFilters } from '../../Components/MarketplaceFilters/MarketplaceFilters';
import { ShopDetailView } from '../../Components/ShopDetailView/ShopDetailView';
import { WishlistDrawer } from '../../Components/WishlistDrawer/WishlistDrawer';
import type { WishlistItem } from '../../Components/WishlistDrawer/WishlistDrawer';
import { PastOrdersDrawer } from '../../Components/PastOrdersDrawer/PastOrdersDrawer';
import { MarketplaceHeader } from './Components/MarketplaceHeader';
import { ShopListGrid } from './Components/ShopListGrid';
import { useToast } from '../../context/ToastContext';
import type { PetShop, CartItem } from '../../schemas';
import './MarketplacePage.css';

import { API_URL } from '../../config/api';
const TAG_FILTERS = ['All', 'Delivery', 'Pickup Only', 'Food', 'Toys', 'Grooming', 'Health'];

export const MarketplacePage = () => {
  const { showToast } = useToast();
  const [shops, setShops] = useState<PetShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<PetShop | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [pastOrdersOpen, setPastOrdersOpen] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('petsos_wishlist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');

  useEffect(() => {
    try {
      localStorage.setItem('petsos_wishlist_v1', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await axios.get<PetShop[]>(`${API_URL}/marketplace/shops`);
        setShops(res.data);
      } catch (err) {
        console.error('Failed to fetch shops:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShops();
  }, []);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product._id === product._id);
      if (existing) {
        return prev.map((i) =>
          i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.product._id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.product._id === productId ? { ...i, quantity } : i))
      );
    }
  };

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTag === 'All') return true;
    if (activeTag === 'Delivery') return shop.deliveryAvailable;
    if (activeTag === 'Pickup Only') return shop.pickupOnly;
    return shop.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase());
  });

  const handleCheckout = async (details?: {
    fulfillmentMode: 'delivery' | 'pickup';
    deliveryFee: number;
    streetAddress: string;
    city: string;
    apt: string;
    paymentMethod: string;
    paymentIntentId?: string;
  }) => {
    const deliveryType = details?.fulfillmentMode === 'delivery' ? 'daas_delivery' : 'pickup';
    const address = details ? `${details.streetAddress}, ${details.city}` : 'Haifa, Israel';
    const totalCost = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0) + (deliveryType === 'daas_delivery' ? (details?.deliveryFee || 25) : 0);

    try {
      const firstProduct = cartItems[0]?.product;
      const orderPayload = {
        storeId: firstProduct?.shopId || 'shop-haifa-1',
        customerId: 'default',
        customerName: 'Customer',
        customerAddress: address,
        deliveryType,
        items: cartItems.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        subtotal: cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0),
        paymentIntentId: details?.paymentIntentId,
      };

      const { data: order } = await axios.post(`${API_URL}/marketplace/orders`, orderPayload);
      if (order?._id && details?.paymentIntentId) {
        await axios.post(`${API_URL}/marketplace/orders/${order._id}/payment-confirm`, {
          paymentIntentId: details.paymentIntentId,
        });
      }
      setCartItems([]);
      setCartOpen(false);

      if (deliveryType === 'pickup') {
        showToast(`איסוף עצמי אושר! סה״כ לתשלום: ₪${totalCost}`, 'success', '🛍️ Pickup Confirmed');
      } else {
        showToast(`הזמנת משלוח נשלחה! שליח וולט בדרך אליך.`, 'success', '🛵 Courier Dispatched');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      showToast('ארעה שגיאה בתהליך התשלום, אנא נסה שוב.', 'error', 'Payment Failed');
    }
  };

  const handleSelectShopFromWishlist = (shopId: string) => {
    const found = shops.find((s) => s._id === shopId);
    if (found) {
      setSelectedShop(found);
    } else if (shops.length > 0) {
      setSelectedShop(shops[0]);
    }
  };

  if (selectedShop) {
    return (
      <>
        <ShopDetailView
          shop={selectedShop}
          cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
          onBack={() => setSelectedShop(null)}
          onOpenCart={() => setCartOpen(true)}
          onAddToCart={addToCart}
          onToggleWishlist={(prod) => {
            const exists = wishlist.some((w) => w._id === prod._id);
            if (exists) {
              setWishlist((prev) => prev.filter((w) => w._id !== prod._id));
            } else {
              setWishlist((prev) => [
                ...prev,
                {
                  _id: prod._id || `prod_${Date.now()}`,
                  name: prod.name,
                  price: prod.price,
                  category: prod.category,
                  shopName: selectedShop.name,
                  shopId: selectedShop._id || 'shop-haifa-1',
                },
              ]);
            }
          }}
          wishlistIds={wishlist.map((w) => w._id)}
        />
        <Cart
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onCheckout={handleCheckout}
        />
        <WishlistDrawer
          isOpen={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
          wishlist={wishlist}
          onRemove={(id) => setWishlist((prev) => prev.filter((w) => w._id !== id))}
          onMoveToCart={(item) => {
            addToCart({
              _id: item._id,
              name: item.name,
              description: '',
              price: item.price,
              category: item.category,
              inStock: true,
              shopId: item.shopId || 'shop-haifa-1',
            });
            setWishlist((prev) => prev.filter((w) => w._id !== item._id));
          }}
          onSelectShop={handleSelectShopFromWishlist}
        />
      </>
    );
  }

  return (
    <div className="marketplace-page page page-padded" id="marketplace-page">
      <MarketplaceHeader
        wishlistCount={wishlist.length}
        onOpenPastOrders={() => setPastOrdersOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
      />

      <MarketplaceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTag={activeTag}
        onTagChange={setActiveTag}
        tags={TAG_FILTERS}
      />

      <ShopListGrid
        isLoading={isLoading}
        shops={filteredShops}
        onSelectShop={(shop) => setSelectedShop(shop)}
      />

      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlist={wishlist}
        onRemove={(id) => setWishlist((prev) => prev.filter((w) => w._id !== id))}
        onMoveToCart={(item) => {
          addToCart({
            _id: item._id,
            name: item.name,
            description: '',
            price: item.price,
            category: item.category,
            inStock: true,
            shopId: item.shopId || 'shop-haifa-1',
          });
          setWishlist((prev) => prev.filter((w) => w._id !== item._id));
        }}
        onSelectShop={handleSelectShopFromWishlist}
      />

      <PastOrdersDrawer
        isOpen={pastOrdersOpen}
        onClose={() => setPastOrdersOpen(false)}
        apiUrl={API_URL}
        onReorder={(items) => {
          items.forEach((it) => {
            addToCart({
              _id: it.productId || `prod_${Date.now()}`,
              name: it.productName,
              description: '',
              price: it.unitPrice,
              category: 'Reordered Items',
              inStock: true,
              shopId: it.storeId || 'shop-haifa-1',
            });
          });
          setCartOpen(true);
        }}
      />

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
      />
    </div>
  );
};
