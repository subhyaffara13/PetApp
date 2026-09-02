import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { OfflineBanner } from './Components/OfflineBanner/OfflineBanner';
import { AuthModal } from './Components/AuthModal/AuthModal';
import { ProtectedRoute } from './Components/ProtectedRoute/ProtectedRoute';
import { BottomNav } from './Components/BottomNav/BottomNav';
import { CookieBanner } from './Components/CookieBanner/CookieBanner';
import { LegalModal } from './Components/LegalModal/LegalModal';
import { ContactSupportModal } from './Components/ContactSupportModal/ContactSupportModal';
import { FloatingSupportWidget } from './Components/FloatingSupportWidget/FloatingSupportWidget';
import { LostPetNotificationTicker } from './Components/LostPetNotificationTicker/LostPetNotificationTicker';
import { ErrorBoundary } from './Components/ErrorBoundary/ErrorBoundary';
import { EmergencyPage } from './pages/EmergencyPage/EmergencyPage';
import { ChatPage } from './pages/ChatPage/ChatPage';
import { ProfilePage } from './pages/ProfilePage/ProfilePage';
import { MarketplacePage } from './pages/MarketplacePage/MarketplacePage';
import { CommunityPage } from './pages/CommunityPage/CommunityPage';
import './App.css';

// Lazy-loaded unified professional portals
const ClinicPortalPage = lazy(() => import('./portals/ClinicPortal/App'));
const StorePortalPage = lazy(() => import('./portals/StorePortal/App'));
const GroomerPortalPage = lazy(() => import('./portals/GroomerPortal/App'));
const AdminPortalPage = lazy(() => import('./portals/AdminPortal/App'));

const AppContent = () => {
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportCategory, setSupportCategory] = useState('bug');
  const navigate = useNavigate();
  const location = useLocation();

  const isPortal =
    location.pathname.startsWith('/clinic') ||
    location.pathname.startsWith('/store') ||
    location.pathname.startsWith('/groomer') ||
    location.pathname.startsWith('/admin');

  if (isPortal) {
    return (
      <div className="portal-root-layout">
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0f172a',
                color: '#38bdf8',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 700,
              }}
            >
              Loading PetSOS Station Portal...
            </div>
          }
        >
          <Routes>
            <Route path="/clinic/*" element={<ClinicPortalPage />} />
            <Route path="/store/*" element={<StorePortalPage />} />
            <Route path="/groomer/*" element={<GroomerPortalPage />} />
            <Route path="/admin/*" element={<AdminPortalPage />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <OfflineBanner />
      <LostPetNotificationTicker />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<EmergencyPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute title="Sign In for AI Assistant" description="Chat with our guardrailed AI about diet, behavior, & everyday advice.">
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute title="Sign In for Pet Profiles" description="Create and store your pet's medical passport and condition records.">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute title="Sign In for Marketplace" description="Shop products from local pet stores with direct DaaS delivery.">
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <BottomNav />
      <AuthModal />
      <FloatingSupportWidget
        onOpenAiChat={() => navigate('/chat')}
        onOpenContactForm={(cat) => { setSupportCategory(cat || 'bug'); setShowSupportModal(true); }}
        onOpenPrivacyPolicy={() => setLegalTab('privacy')}
      />
      <CookieBanner
        onOpenPrivacyPolicy={() => setLegalTab('privacy')}
        onOpenTerms={() => setLegalTab('terms')}
      />
      {legalTab && <LegalModal initialTab={legalTab} onClose={() => setLegalTab(null)} />}
      {showSupportModal && (
        <ContactSupportModal defaultCategory={supportCategory} onClose={() => setShowSupportModal(false)} />
      )}
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <ErrorBoundary>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </ErrorBoundary>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;