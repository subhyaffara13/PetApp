import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { MapComponent, type MapItem } from '../../Components/MapComponent/MapComponent';
import { LocationPrompt, type LocationAccuracyMode } from '../../Components/LocationPrompt/LocationPrompt';
import { Cart } from '../../Components/Cart/Cart';
import { ShopDetailView } from '../../Components/ShopDetailView/ShopDetailView';
import { WishlistDrawer, type WishlistItem } from '../../Components/WishlistDrawer/WishlistDrawer';
import { PastOrdersDrawer } from '../../Components/PastOrdersDrawer/PastOrdersDrawer';
import { MarketplaceHeaderActions } from './Components/MarketplaceHeaderActions';
import { MarketplaceBottomSheet } from './Components/MarketplaceBottomSheet';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { useGeolocation } from '../../Hooks/useGeolocation';
import { reverseGeocodeCountry } from '../../utils/geo';
import type { PetShop, CartItem, Product, UserLocation } from '../../schemas';
import { API_URL } from '../../config/api';
import './MarketplacePage.css';

const DEFAULT_LOCATION: UserLocation = { lat: 32.794, lon: 34.9896 };

export const MarketplacePage = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { currentLang, t } = useTranslation();
  const { location: geoLoc } = useGeolocation();

  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATION);
  const [cityName, setCityName] = useState<string>('Haifa');
  const [accuracyMode, setAccuracyMode] = useState<LocationAccuracyMode>('approximate_default');
  const [shops, setShops] = useState<PetShop[]>([]);
  const [selectedShop, setSelectedShop] = useState<PetShop | null>(null);

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

  useEffect(() => {
    if (geoLoc && !manualLocationSet.current) {
      setUserLocation(geoLoc);
      setAccuracyMode('gps_exact');
    }
  }, [geoLoc]);

  useEffect(() => {
    try {
      localStorage.setItem('petsos_wishlist_v1', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const fetchShops = useCallback(
    async (loc: UserLocation) => {
      try {
        const res = await axios.get<PetShop[]>(`${API_URL}/marketplace/shops`, {
          params: { lat: loc.lat, lon: loc.lon, lang: currentLang, country: cityName },
          timeout: 5000,
        });
        if (res.data && Array.isArray(res.data)) setShops(res.data);
      } catch (err) {
        console.error('Failed to fetch shops:', err);
      }
    },
    [currentLang, cityName]
  );

  useEffect(() => {
    fetchShops(userLocation);
  }, [userLocation, fetchShops]);

  const mapItems: MapItem[] = shops.map((s) => ({
    id: s._id || s.id || s.name,
    name: s.name,
    address: s.address,
    location: s.location,
    isStore: true,
    itemType: 'store',
    isOpenNow: s.isOpen ?? true,
    category: s.isRegistered ? 'partner' : 'store',
    rating: s.rating,
  }));

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const deliveryCount = shops.filter((s) => s.deliveryAvailable).length;

  const handleRecenter = () => {
    manualLocationSet.current = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          setAccuracyMode('gps_exact');
          reverseGeocodeCountry(loc.lat, loc.lon).then((res) => {
            if (res.cityName) setCityName(res.cityName);
          });
        },
        () => {
          if (geoLoc) {
            setUserLocation(geoLoc);
            setAccuracyMode('gps_exact');
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else if (geoLoc) {
      setUserLocation(geoLoc);
      setAccuracyMode('gps_exact');
    }
  };

  return (
    <div className="marketplace-page page" id="marketplace-page">
      <MarketplaceHeaderActions
        shopsCount={shops.length}
        deliveryCount={deliveryCount}
        totalCartCount={totalCartCount}
        wishlistCount={wishlist.length}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCart={() => setCartOpen(true)}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenPastOrders={() => setPastOrdersOpen(true)}
        t={t}
      />

      <div className="marketplace-location-bar">
        <LocationPrompt
          currentCityName={cityName}
          accuracyMode={accuracyMode}
          centerCoordinates={{ lat: userLocation.lat, lng: userLocation.lon }}
          onLocationFound={(coords) => {
            manualLocationSet.current = true;
            setUserLocation({ lat: coords.lat, lon: coords.lng });
            if (coords.name) setCityName(coords.name);
            setAccuracyMode('city_selected');
          }}
          onRecenter={handleRecenter}
        />
      </div>

      <div className="marketplace-page__map-wrapper">
        <MapComponent
          userLocation={userLocation}
          items={mapItems}
          selectedItem={mapItems.find((m) => m.id === (selectedShop?._id || selectedShop?.id)) || null}
          onItemSelect={(item) => {
            const found = shops.find((s) => (s._id || s.id) === item.id);
            if (found) {
              setSelectedShop(found);
            }
          }}
          mode="marketplace"
        />
      </div>

      <MarketplaceBottomSheet
        shops={shops}
        userLocation={userLocation}
        selectedShop={selectedShop}
        onSelectShop={(shop) => setSelectedShop(shop)}
        onOpenCatalog={setActiveCatalogShop}
        t={t}
      />

      {activeCatalogShop && (
        <ShopDetailView
          shop={activeCatalogShop}
          cartCount={totalCartCount}
          onBack={() => setActiveCatalogShop(null)}
          onOpenCart={() => setCartOpen(true)}
          onAddToCart={(product: Product) => {
            setCartItems((prev) => {
              const existing = prev.find((i) => i.product._id === product._id);
              if (existing) {
                return prev.map((i) =>
                  i.product._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
                );
              }
              return [...prev, { product, quantity: 1 }];
            });
            showToast(`Added ${product.name} to cart!`, 'success');
          }}
          wishlistIds={wishlist.map((w) => w._id)}
          onToggleWishlist={(item: Product) => {
            const wItem: WishlistItem = {
              _id: item._id || String(Date.now()),
              name: item.name,
              price: item.price,
              category: item.category || 'General',
              shopId: item.shopId,
            };
            setWishlist((prev) =>
              prev.some((w) => w._id === wItem._id)
                ? prev.filter((w) => w._id !== wItem._id)
                : [...prev, wItem]
            );
          }}
        />
      )}

      {cartOpen && (
        <Cart
          isOpen={cartOpen}
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onUpdateQuantity={(productId, delta) => {
            setCartItems((prev) =>
              prev
                .map((i) => (i.product._id === productId ? { ...i, quantity: i.quantity + delta } : i))
                .filter((i) => i.quantity > 0)
            );
          }}
          onCheckout={() => setCartItems([])}
        />
      )}

      {wishlistOpen && (
        <WishlistDrawer
          isOpen={wishlistOpen}
          onClose={() => setWishlistOpen(false)}
          wishlist={wishlist}
          onRemove={(id: string) => setWishlist((prev) => prev.filter((w) => w._id !== id))}
          onMoveToCart={(item: WishlistItem) => {
            const product: Product = {
              _id: item._id,
              name: item.name,
              price: item.price,
              category: item.category || 'General',
              inStock: true,
              shopId: item.shopId || 'shop-1',
              description: '',
            };
            setCartItems((prev) => [...prev, { product, quantity: 1 }]);
            showToast(`Added ${item.name} to cart!`, 'success');
          }}
        />
      )}

      {pastOrdersOpen && (
        <PastOrdersDrawer
          isOpen={pastOrdersOpen}
          onClose={() => setPastOrdersOpen(false)}
          apiUrl={API_URL}
          onReorder={(reorderItems: any[]) => {
            setCartItems((prev) => [...prev, ...reorderItems]);
            setPastOrdersOpen(false);
            setCartOpen(true);
          }}
        />
      )}
    </div>
  );
};
