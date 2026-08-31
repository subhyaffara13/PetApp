import { useEffect, useRef, useState, useCallback } from 'react';
import type { Clinic, UserLocation } from '../../schemas';
import { haversine, getDirectionsUrl } from '../../utils/geo';
import { ChevronUp, ChevronDown, Phone, Navigation, Globe, Send, Search, X } from 'lucide-react';
import { EmergencyDispatchModal } from '../EmergencyDispatchModal/EmergencyDispatchModal';
import { useTranslation } from '../../context/LanguageContext';
import './ClinicBottomSheet.css';

interface ClinicBottomSheetProps {
  clinics: Clinic[];
  userLocation: UserLocation;
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedClinicId: string | null;
  onClinicCardClick?: (clinic: Clinic) => void;
}

export const ClinicBottomSheet = ({
  clinics,
  userLocation,
  selectedClinicId,
  onClinicCardClick,
}: ClinicBottomSheetProps) => {
  const { t } = useTranslation();
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [sheetHeight, setSheetHeight] = useState<number>(30);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startDragY = useRef<number>(0);
  const startHeight = useRef<number>(30);
  const [clinicFilter, setClinicFilter] = useState<'all' | 'open' | 'verified' | 'capacity'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dispatchClinic, setDispatchClinic] = useState<Clinic | null>(null);

  // Compute distances & sort: verified 24/7 first, then distance
  const sortedClinics: Array<Clinic & { computedDist: number; isVerified: boolean }> = clinics
    .map((c) => {
      const dist =
        typeof c.distance === 'number'
          ? c.distance
          : haversine(userLocation.lat, userLocation.lon, c.location.lat, c.location.lng);
      const isVerified =
        c.tier === 'verified' ||
        Boolean(c.openingHours && c.openingHours.toLowerCase().includes('24'));
      return { ...c, isClaimed: c.isClaimed, computedDist: dist, isVerified };
    })
    .sort((a, b) => {
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return a.computedDist - b.computedDist;
    });

  const displayClinics = sortedClinics.filter((c) => {
    if (clinicFilter === 'open' && !c.isOpenNow) return false;
    if (clinicFilter === 'verified' && !c.isVerified) return false;
    if (clinicFilter === 'capacity' && c.capacityStatus !== 'accepting') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchAddr = (c.address || '').toLowerCase().includes(q);
      const matchPhone = (c.phoneNum || '').includes(q);
      return matchName || matchAddr || matchPhone;
    }
    return true;
  });

  // When selectedClinicId changes, expand to preview and scroll
  useEffect(() => {
    if (!selectedClinicId) return;
    setSheetHeight((prev) => (prev < 25 ? 35 : prev));
    const cardEl = document.getElementById(`card-${selectedClinicId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('flash');
      const timer = setTimeout(() => {
        cardEl.classList.remove('flash');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedClinicId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startDragY.current = e.clientY;
    startHeight.current = sheetHeight;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaY = startDragY.current - e.clientY;
    const deltaVh = (deltaY / window.innerHeight) * 100;
    const newHeight = Math.max(6, Math.min(62, startHeight.current + deltaVh));
    setSheetHeight(newHeight);
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    setSheetHeight((h) => {
      if (h < 18) return 6;
      if (h < 48) return 32;
      return 62;
    });
  }, [isDragging]);

  const toggleSnap = () => {
    setSheetHeight((current) => {
      if (current <= 10) return 32;
      if (current <= 40) return 62;
      return 6;
    });
  };

  return (
    <>
      <div
        ref={sheetRef}
        id="sheet"
        className={`clinic-bottom-sheet ${isDragging ? 'is-dragging' : ''}`}
        style={{ height: `${sheetHeight}vh` }}
      >
        {/* Dynamic Draggable Handle & Header */}
        <div
          className="handle-wrap"
          id="sheet-handle"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="handle" />
          <div className="sheet-top-bar" onClick={toggleSnap}>
            <span className="sheet-label">
              {sortedClinics.length} {t('emergency.vets_nearby_prefix', 'clinics nearby')} · {sheetHeight <= 10 ? 'Swipe up' : t('emergency.sheet_drag_hint', 'Drag to adjust')}
            </span>
            <button
              type="button"
              className="sheet-toggle-icon-btn"
              aria-label="Toggle sheet height"
            >
              {sheetHeight >= 50 ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>
        </div>

        {/* Quick Clinic / Vet / Neighborhood Search Bar */}
        <div style={{ padding: '0.4rem 0.85rem 0.2rem', background: 'var(--color-bg-secondary, #0f172a)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--color-bg-elevated, rgba(255,255,255,0.06))',
              border: '1px solid var(--color-border, #334155)',
              borderRadius: 8,
              padding: '0.35rem 0.65rem',
            }}
          >
            <Search size={14} color="var(--color-primary, #38bdf8)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by clinic name, doctor, street (e.g. Bat Galim, Moriah, שורשים)..."
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: 'var(--color-text-primary, #f8fafc)',
                fontSize: '0.78rem',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', padding: '0.4rem 1rem', overflowX: 'auto', background: '#0f172a', borderBottom: '1px solid #334155' }}>
          <button
            type="button"
            style={{
              background: clinicFilter === 'all' ? '#2563eb' : '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '0.3rem 0.65rem',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setClinicFilter('all')}
          >
            {t('emergency.filter_all', 'All')} ({sortedClinics.length})
          </button>
          <button
            type="button"
            style={{
              background: clinicFilter === 'open' ? '#10b981' : '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '0.3rem 0.65rem',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setClinicFilter('open')}
          >
            {t('emergency.filter_open', '🟢 Open Now')}
          </button>
          <button
            type="button"
            style={{
              background: clinicFilter === 'verified' ? '#8b5cf6' : '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '0.3rem 0.65rem',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setClinicFilter('verified')}
          >
            {t('emergency.filter_247', '⭐ 24/7 ER Only')}
          </button>
          <button
            type="button"
            style={{
              background: clinicFilter === 'capacity' ? '#f59e0b' : '#1e293b',
              color: '#fff',
              border: 'none',
              padding: '0.3rem 0.65rem',
              borderRadius: 6,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onClick={() => setClinicFilter('capacity')}
          >
            {t('emergency.filter_immediate', '🚨 Immediate Intake')}
          </button>
        </div>

        {/* Cards list */}
        <div
          id="cards"
          className={`sheet-cards-list ${sheetHeight <= 10 ? 'sheet-cards-hidden' : ''}`}
          ref={cardsContainerRef}
        >
          {displayClinics.map((clinic) => {
            const dirUrl = getDirectionsUrl(clinic.location.lat, clinic.location.lng);

            return (
              <div
                key={clinic.id}
                className={`card ${clinic.isVerified ? 'card-verified' : 'card-standard'}`}
                id={`card-${clinic.id}`}
                onClick={() => onClinicCardClick?.(clinic)}
              >
                <div className="card-top">
                  <div>
                    {clinic.isVerified ? (
                      <span className="tag tag-emergency">{t('emergency.tag_verified_er', 'VERIFIED 24/7 ER')}</span>
                    ) : clinic.isOpenNow ? (
                      <span className="tag tag-regular">{t('emergency.tag_community_open', 'COMMUNITY VET · OPEN NOW')}</span>
                    ) : (
                      <span className="tag tag-closed">{t('emergency.tag_closed', 'CLOSED NOW')}</span>
                    )}
                    <h3>{clinic.name}</h3>
                    <p className={`hours ${clinic.isVerified ? '' : 'hours-unverified'}`}>
                      {clinic.openingHours || (clinic.isOpenNow ? t('emergency.filter_open', 'Open Now') : t('emergency.tag_closed', 'Closed'))}
                    </p>
                  </div>
                  <div className="dist mono">
                    {clinic.computedDist.toFixed(1)}
                    <span>km</span>
                  </div>
                </div>

                {!clinic.isVerified && (
                  <p className="warn">Standard clinic hours — call ahead for non-emergency visits</p>
                )}

                {/* Primary SOS Action Bar */}
                <div className="card-primary-sos-row" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-alert-clinic"
                    onClick={() => setDispatchClinic(clinic)}
                  >
                    <Send size={13} /> {t('emergency.btn_alert_coming', "🚨 Alert Clinic I'm Coming")}
                  </button>
                </div>

                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                  {clinic.phoneNum && clinic.phoneNum.trim().length > 0 && (
                    <a className={`btn-action ${clinic.isVerified ? 'btn-call-emergency' : 'btn-call-standard'}`} href={`tel:${clinic.phoneNum}`}>
                      <Phone size={13} /> {t('emergency.btn_call', 'Call')}
                    </a>
                  )}
                  <a className="btn-action btn-dir" href={dirUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation size={13} /> {t('emergency.btn_directions', 'Directions')}
                  </a>
                  {clinic.website && (
                    <a className="btn-action btn-web" href={clinic.website} target="_blank" rel="noopener noreferrer">
                      <Globe size={13} /> Site
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emergency Pre-arrival Dispatch Modal */}
      {dispatchClinic && (
        <EmergencyDispatchModal
          clinic={dispatchClinic}
          onClose={() => setDispatchClinic(null)}
        />
      )}
    </>
  );
};
