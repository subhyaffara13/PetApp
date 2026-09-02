import { useEffect, useRef, useState, useCallback } from 'react';
import type { Clinic, UserLocation } from '../../schemas';
import { haversine } from '../../utils/geo';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { EmergencyDispatchModal } from '../EmergencyDispatchModal/EmergencyDispatchModal';
import { UniversalBookingModal, type BookingProviderContext } from '../UniversalBookingModal/UniversalBookingModal';
import { ClinicItemCard } from './Components/ClinicItemCard';
import { ClinicFilterTabs } from './Components/ClinicFilterTabs';
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
  const [sheetHeight, setSheetHeight] = useState<number>(30);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startDragY = useRef<number>(0);
  const startHeight = useRef<number>(30);
  const [clinicFilter, setClinicFilter] = useState<'all' | 'open' | 'verified' | 'capacity' | 'mobile'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dispatchClinic, setDispatchClinic] = useState<Clinic | null>(null);
  const [bookingProvider, setBookingProvider] = useState<BookingProviderContext | null>(null);

  const sortedClinics = clinics
    .map((c) => {
      const dist =
        typeof c.distance === 'number'
          ? c.distance
          : haversine(userLocation.lat, userLocation.lon, c.location.lat, c.location.lng);
      const isVerified =
        c.tier === 'verified' ||
        Boolean(c.openingHours && c.openingHours.toLowerCase().includes('24'));
      return { ...c, computedDist: dist, isVerified };
    })
    .sort((a, b) => {
      if (a.isMobileVet && !b.isMobileVet) return -1;
      if (!a.isMobileVet && b.isMobileVet) return 1;
      if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;
      return a.computedDist - b.computedDist;
    });

  const displayClinics = sortedClinics.filter((c) => {
    if (clinicFilter === 'mobile' && !c.isMobileVet && c.practiceType !== 'mobile_vet') return false;
    if (clinicFilter === 'open' && !c.isOpenNow) return false;
    if (clinicFilter === 'verified' && !c.isVerified) return false;
    if (clinicFilter === 'capacity' && c.capacityStatus !== 'accepting') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.address || '').toLowerCase().includes(q) || (c.phoneNum || '').includes(q);
    }
    return true;
  });

  useEffect(() => {
    if (!selectedClinicId) return;
    setSheetHeight((prev) => (prev < 25 ? 35 : prev));
    const cardEl = document.getElementById(`card-${selectedClinicId}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('flash');
      const timer = setTimeout(() => cardEl.classList.remove('flash'), 1000);
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
    setSheetHeight(Math.max(6, Math.min(62, startHeight.current + deltaVh)));
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  }, [isDragging]);

  return (
    <div
      className={`clinic-bottom-sheet ${sheetHeight > 35 ? 'clinic-bottom-sheet--expanded' : ''}`}
      style={{ height: `${sheetHeight}vh` }}
    >
      <div className="clinic-bottom-sheet__handle-wrapper" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
        <div className="clinic-bottom-sheet__handle" />
        <span className="drag-hint-text">
          {sheetHeight > 35 ? <ChevronDown size={14} /> : <ChevronUp size={14} />} {t('emergency.sheet_drag_hint', 'Drag to adjust')}
        </span>
      </div>

      <ClinicFilterTabs
        clinicFilter={clinicFilter}
        setClinicFilter={setClinicFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        t={t}
      />

      <div className="clinic-bottom-sheet__cards">
        {displayClinics.map((clinic) => (
          <ClinicItemCard
            key={clinic.id}
            clinic={clinic}
            userLocation={userLocation}
            isSelected={selectedClinicId === clinic.id}
            onCardClick={onClinicCardClick}
            onDispatchClick={(c) => setDispatchClinic(c)}
            onBookVisitClick={(c) => setBookingProvider({ id: c.id, name: c.name, type: 'clinic', phone: c.phoneNum, badgeType: 'clinic_admin' })}
            t={t}
          />
        ))}
        {displayClinics.length === 0 && (
          <div className="sheet-empty-state">No emergency clinics match current filter/search.</div>
        )}
      </div>

      <EmergencyDispatchModal
        isOpen={!!dispatchClinic}
        onClose={() => setDispatchClinic(null)}
        clinic={dispatchClinic}
        userLocation={userLocation}
      />

      <UniversalBookingModal
        isOpen={!!bookingProvider}
        onClose={() => setBookingProvider(null)}
        provider={bookingProvider}
      />
    </div>
  );
};
