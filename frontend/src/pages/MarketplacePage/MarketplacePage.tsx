import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  Navigation,
  Clock,
  Star,
  Truck,
  ChevronUp,
  ChevronDown,
  Heart,
  History,
  Store as StoreIcon,
  Package,
} from 'lucide-react';
import { MapComponent, type MapItem } from '../../Components/MapComponent/MapComponent';
import { LocationPrompt, type LocationAccuracyMode } from '../../Components/LocationPrompt/LocationPrompt';
import { Cart } from '../../Components/Cart/Cart';
import { ShopDetailView } from '../../Components/ShopDetailView/ShopDetailView';
import { WishlistDrawer, type WishlistItem } from '../../Components/WishlistDrawer/WishlistDrawer';
import { PastOrdersDrawer } from '../../Components/PastOrdersDrawer/PastOrdersDrawer';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from '../../context/LanguageContext';
import { useGeolocation } from '../../Hooks/useGeolocation';
import { getDirectionsUrl } from '../../utils/geo';
import type { PetShop, CartItem, UserLocation } from '../../schemas';
import { API_URL } from '../../config/api';
import './MarketplacePage.css';

const TAG_FILTERS = ['All', '🛵 Wolt Delivery', '💊 Pharmacy', '🍖 Food', '🧸 Toys', '🏥 Health'];

const DEFAULT_LOCATION: UserLocation = { lat: 32.794, lon: 34.9896 };

export const MarketplacePage = () => {
  const { showToast } = useToast();
  const { currentLang, t } = useTranslation();
  const { location: geoLoc } = useGeolocation();

  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [cityName, setCityName] = useState<string>('Haifa');
  const [accuracyMode, setAccuracyMode] = useState<LocationAccuracyMode>('approximate_default');
  const [shops, setShops] = useState<PetShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<PetShop | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [activeTag, setActiveTag] = useState('All');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [pastOrdersOpen, setPastOrdersOpen] = useState(false);
  const [activeCatalogShop, setActiveCatalogShop] = useState<PetShop | null>(null);

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('petsos_wishlist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const manualLocationSet = useRef(false);

  // Sync GPS if not manually set
  useEffect(() => {
    if (geoLoc && !manualLocationSet.current) {
      setUserLocation(geoLoc);
      setAccuracyMode('gps_exact');
    }
  }, [geoLoc]);

  // Persist Wishlist
  useEffect(() => {
    try {
      localStorage.setItem('petsos_wishlist_v1', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Fetch Nearby Stores Globally
  const fetchShops = useCallback(async (loc: UserLocation) => {
    setIsLoading(true);
    try {
      const res = await axios.get<PetShop[]>(`${API_URL}/marketplace/shops`, {
        params: {
          lat: loc.lat,
          lon: loc.lon,
          lang: currentLang,
          country: cityName,
        },
        timeout: 5000,
      });
      if (res.data && Array.isArray(res.data)) {
        setShops(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLang, cityName]);

  useEffect(() => {
    fetchShops(userLocation);
  }, [userLocation, fetchShops]);

  // Handle Street / City Selection from LocationPrompt
  const handleLocationFound = (coords: { lat: number; lng: number; name: string }) => {
    manualLocationSet.current = true;
    setSelectedShop(null);
    const newLoc = { lat: coords.lat, lon: coords.lng };
    const shortName = coords.name.split(',')[0];
    setUserLocation(newLoc);
    setCityName(shortName);
    setAccuracyMode('city_selected');
  };

  const handleRecenter = () => {
    setSelectedShop(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          manualLocationSet.current = false;
          setUserLocation(newLoc);
          setAccuracyMode('gps_exact');
          setCityName('Near You');
        },
        () => {
          setUserLocation(DEFAULT_LOCATION);
          setAccuracyMode('approximate_default');
        }
      );
    }
  };

  // Convert shops to MapItems for Leaflet markers
  const mapItems: MapItem[] = shops.map((shop, idx) => {
    const isPharmacy =
      shop.name.toLowerCase().includes('pharmacy') ||
      shop.name.toLowerCase().includes('rx') ||
      shop.name.toLowerCase().includes('בית מרקחת') ||
      shop.tags?.some((t) => t.toLowerCase().includes('pharmacy'));

    return {
      id: String(shop._id || (shop as any).id || `shop-${idx}`),
      name: shop.name,
      location: shop.location || { lat: userLocation.lat, lng: userLocation.lon },
      itemType: 'store',
      category: isPharmacy ? 'pharmacy' : 'retail',
      shopData: shop,
    };
  });

  const filteredShops = shops.filter((shop) => {
    if (activeTag === 'All') return true;
    if (activeTag.includes('Wolt Delivery') || activeTag.includes('Delivery')) return shop.deliveryAvailable;
    if (activeTag.includes('Pharmacy')) {
      return (
        shop.name.toLowerCase().includes('pharmacy') ||
        shop.name.toLowerCase().includes('rx') ||
        shop.name.toLowerCase().includes('בית מרקחת') ||
        shop.tags?.some((t) => t.toLowerCase().includes('pharmacy'))
      );
    }
    const cleanTag = activeTag.replace(/^[^\w\s]+/, '').trim().toLowerCase();
    return shop.tags?.some((t) => t.toLowerCase().includes(cleanTag));
  });

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
    const address = details ? `${details.streetAddress}, ${details.city}` : `${cityName}, Global`;
    const totalCost =
      cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0) +
      (deliveryType === 'daas_delivery' ? details?.deliveryFee || 25 : 0);

    try {
      const firstProduct = cartItems[0]?.product;
      const orderPayload = {
        storeId: firstProduct?.shopId || 'shop-global-1',
        customerId: 'default',
        customerName: 'Pet Parent',
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
        showToast(`איסוף עצמי אושר! סה״כ: ₪${totalCost}`, 'success', '🛍️ Pickup Confirmed');
      } else {
        showToast(`הזמנה התקבלה! שליח וולט Drive שובץ לאיסוף תוך 30 דקות.`, 'success', '🛵 Wolt Drive Dispatched');
      }
    } catch (err) {
      console.error('Checkout failed:', err);
      showToast('שגיאה בביצוע ההזמנה, אנא נסה שוב.', 'error', 'Order Failed');
    }
  };

  // If viewing a full store catalog
  if (activeCatalogShop) {
    return (
      <>
        <ShopDetailView
          shop={activeCatalogShop}
          cartCount={cartItems.reduce((s, i) => s + i.quantity, 0)}
          onBack={() => setActiveCatalogShop(null)}
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
                  shopName: activeCatalogShop.name,
                  shopId: activeCatalogShop._id,
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
      </>
    );
  }

  return (
    <div className="marketplace-page-map-layout" id="marketplace-page">
      {/* 1. Full-Height Interactive Map with Store Pins */}
      <MapComponent
        userLocation={userLocation}
        items={mapItems}
        mode="marketplace"
        selectedItem={
          selectedShop
            ? {
                id: String(selectedShop._id || selectedShop.name),
                name: selectedShop.name,
                location: selectedShop.location || { lat: userLocation.lat, lng: userLocation.lon },
              }
            : null
        }
        theme="dark"
        onItemSelect={(item) => {
          const found = shops.find((s) => s._id === item.id);
          if (found) {
            setSelectedShop(found);
            setIsSheetExpanded(true);
          }
        }}
      />

      {/* 2. Top Floating Controls: Street-Level Search & Header Shortcuts */}
      <div className="marketplace-top-floating-bar">
        <LocationPrompt
          currentCityName={cityName}
          accuracyMode={accuracyMode}
          centerCoordinates={{ lat: userLocation.lat, lng: userLocation.lon }}
          onLocationFound={handleLocationFound}
          onRecenter={handleRecenter}
        />

        <div className="marketplace-floating-actions">
          <button
            type="button"
            className="floating-action-pill"
            onClick={() => setWishlistOpen(true)}
            title="Wishlist"
          >
            <Heart size={16} className="text-pink-400" />
            {wishlist.length > 0 && <span className="action-counter">{wishlist.length}</span>}
          </button>

          <button
            type="button"
            className="floating-action-pill"
            onClick={() => setPastOrdersOpen(true)}
            title="Past Orders"
          >
            <History size={16} />
          </button>

          <button
            type="button"
            className="floating-action-pill cart-pill"
            onClick={() => setCartOpen(true)}
            title="Cart"
          >
            <ShoppingBag size={16} />
            {cartItems.length > 0 && (
              <span className="action-counter cart-counter">
                {cartItems.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Pull-Up Bottom Sheet Drawer for Pet Stores */}
      <div className={`store-bottom-sheet ${isSheetExpanded ? 'sheet-expanded' : 'sheet-collapsed'}`}>
        {/* Drag Handle Bar */}
        <div
          className="store-sheet-handle-bar"
          onClick={() => setIsSheetExpanded(!isSheetExpanded)}
        >
          <div className="handle-notch" />
          <div className="sheet-handle-info">
            <div className="sheet-title-group">
              <StoreIcon size={16} className="text-sky-400" />
              <h3 className="sheet-title">
                {t('marketplace.nearby_stores', 'Pet Stores & Pharmacies Nearby')} ({filteredShops.length})
              </h3>
            </div>
            <button
              type="button"
              className="sheet-toggle-btn"
              aria-label="Toggle stores drawer"
            >
              {isSheetExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Filter Chips inside Drawer */}
        <div className="store-filter-chips-scroller">
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`store-chip ${activeTag === tag ? 'active' : ''}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stores List */}
        <div className="store-cards-list">
          {isLoading ? (
            <div className="store-loading-state">
              <span className="store-spinner" />
              <p>Scanning pet stores & pharmacies in proximity...</p>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="store-empty-state">
              <StoreIcon size={32} className="text-slate-500" />
              <p>No stores found for this filter in this location.</p>
            </div>
          ) : (
            filteredShops.map((shop) => {
              const isSelected = selectedShop?._id === shop._id;
              const isPharmacy =
                shop.name.toLowerCase().includes('pharmacy') ||
                shop.name.toLowerCase().includes('rx') ||
                shop.tags?.some((t) => t.toLowerCase().includes('pharmacy'));

              return (
                <div
                  key={shop._id}
                  className={`store-card ${isSelected ? 'card-selected' : ''}`}
                  onClick={() => setSelectedShop(shop)}
                >
                  <div className="store-card-header">
                    <div className="store-title-wrap">
                      <h4 className="store-name">
                        {isPharmacy ? '💊 ' : '🛍️ '}
                        {shop.name}
                      </h4>
                      <span className="store-address">{shop.address}</span>
                    </div>

                    <div className="store-badges">
                      {shop.distanceKm !== undefined && (
                        <span className="store-distance-badge">
                          📍 {shop.distanceKm} km
                        </span>
                      )}
                      <span className="store-rating-badge">
                        <Star size={11} className="text-amber-400 fill-amber-400" /> {shop.rating || 4.7}
                      </span>
                    </div>
                  </div>

                  <div className="store-card-meta">
                    <div className="store-hours-pill">
                      <Clock size={12} />
                      <span>{shop.isOpen ? 'Open Now' : 'Closed'}</span>
                    </div>

                    {shop.deliveryAvailable ? (
                      <span className="wolt-delivery-pill">
                        <Truck size={12} /> 🛵 Wolt 30-Min Delivery
                      </span>
                    ) : (
                      <span className="pickup-only-pill">
                        <Package size={12} /> 🛍️ In-Store Pickup
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="store-card-actions">
                    <button
                      type="button"
                      className="btn-store-catalog"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCatalogShop(shop);
                      }}
                    >
                      <ShoppingBag size={14} /> Browse Catalog & Order
                    </button>

                    <a
                      href={getDirectionsUrl(shop.location?.lat || userLocation.lat, shop.location?.lng || userLocation.lon)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-store-dir"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation size={14} /> Directions
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Drawers */}
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
            shopId: item.shopId || 'shop-global-1',
          });
          setWishlist((prev) => prev.filter((w) => w._id !== item._id));
        }}
        onSelectShop={(shopId) => {
          const found = shops.find((s) => s._id === shopId);
          if (found) {
            setActiveCatalogShop(found);
          }
        }}
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
              shopId: it.storeId || 'shop-global-1',
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
