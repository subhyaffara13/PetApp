export interface EmergencyClinicResult {
  id: string;
  name: string;
  address: string;
  isOpenNow: boolean;
  location: { lat: number; lng: number };
  phone: string | null;
  openingHours?: string;
  tier?: 'verified' | 'unverified';
  isClaimed?: boolean;
  rating?: number;
  capacityStatus?: 'accepting' | 'limited' | 'at_capacity';
  isDeclaredOpen?: boolean;
  portalStatusOverride?: 'open' | 'closed' | 'schedule';
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';
  isMobileVet?: boolean;
  isLiveLocation?: boolean;
  heading?: number;
  speed?: number;
  distance?: number;
}

export const HAIFA_FALLBACK_CLINICS: EmergencyClinicResult[] = [
  // --- 24/7 EMERGENCY HOSPITALS & ICUs ---
  {
    id: 'haifa-chavat-daat',
    name: 'Chavat Daat Veterinary Hospital (חוות דעת - לשעבר מדי-וט)',
    address: 'HaHistadrut Blvd 140, Haifa Bay',
    isOpenNow: true,
    openingHours: 'Open 24/7 · Critical Care & CT Trauma Center',
    tier: 'verified',
    location: { lat: 32.795, lng: 35.038 },
    phone: '04-834-2887',
    rating: 4.9,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-moriah-er',
    name: 'Moriah Veterinary Center 24/7 (מרפאה וטרינרית מוריה - ד"ר תדהר קליין)',
    address: 'Moriah Ave 45, Center Carmel, Haifa',
    isOpenNow: true,
    openingHours: 'Open 24/7 · Emergency Care & Surgery',
    tier: 'verified',
    location: { lat: 32.8012, lng: 34.9855 },
    phone: '04-837-2270',
    rating: 4.9,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-shorashim-er',
    name: 'Shorashim 24/7 Animal Emergency Hospital (בית חולים וטרינרי שורשים)',
    address: 'Derech Acco 192, Haifa Bay / Krayot Junction',
    isOpenNow: true,
    openingHours: 'Open 24/7 · Emergency Triage & ICU',
    tier: 'verified',
    location: { lat: 32.812, lng: 35.064 },
    phone: '04-870-0080',
    rating: 4.8,
    capacityStatus: 'accepting',
  },

  // --- CARMEL, AHUZA & RAMAT BEGIN CLINICS ---
  {
    id: 'haifa-family-vet',
    name: 'Family Vet (פמילי וט - ד"ר מור פימה)',
    address: 'Moshe Soroka St 39, Ramat Begin / Ahuza, Haifa',
    isOpenNow: true,
    openingHours: 'Open 24 Hours · 24/7 Emergency Triage (077-205-3303)',
    tier: 'verified',
    location: { lat: 32.776, lng: 34.978 },
    phone: '077-205-3303',
    rating: 4.9,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-vet-hanasi',
    name: 'Vet HaNasi Veterinary Clinic (וט הנשיא - מרכז רפואי לחיות מחמד)',
    address: 'HaNassi Ave 105, Central Carmel, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–19:30 · Fri 09:00–14:00',
    tier: 'verified',
    location: { lat: 32.808, lng: 34.983 },
    phone: '04-838-8999',
    rating: 4.8,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-french-carmel',
    name: 'French Carmel Veterinary Clinic (מרכז וטרינרי כרמל צרפתי)',
    address: 'Tchernichovsky St 37, French Carmel, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–19:00 · Fri 09:00–13:30',
    tier: 'unverified',
    location: { lat: 32.821, lng: 34.972 },
    phone: '04-833-2121',
    rating: 4.7,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-dr-sigal-ritan',
    name: 'Dr. Sigal Ritan Veterinary Practice (ד"ר סיגל ריטן)',
    address: 'Mapu St 13, Ahuza, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–18:30 · Emergency hotline available',
    tier: 'verified',
    location: { lat: 32.788, lng: 34.989 },
    phone: '04-825-7888',
    rating: 4.9,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-daniel-vet',
    name: 'Daniel Veterinary Clinic (דניאל מרפאה וטרינרית)',
    address: 'Moriah Ave 112, Ahuza, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–19:00 · Fri 09:00–14:00',
    tier: 'unverified',
    location: { lat: 32.791, lng: 34.986 },
    phone: '04-838-1234',
    rating: 4.6,
    capacityStatus: 'limited',
  },

  // --- BAT GALIM & COASTAL STRIP CLINICS ---
  {
    id: 'haifa-galim-vet',
    name: 'Galim Veterinary Clinic (מרפאת גלים - בת גלים חיפה)',
    address: 'HaAliya HaShniya St 39, Bat Galim, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–19:00 · Fri 09:00–13:00 (077-350-2400)',
    tier: 'verified',
    location: { lat: 32.8335, lng: 34.9802 },
    phone: '077-350-2400',
    rating: 4.5,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-cityvet-alfasi',
    name: 'CityVet Haifa (סיטיווט - מרפאה וטרינרית ד"ר גבי אלפסי)',
    address: 'Bat Galim / Hadar / Carmel Area, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–19:00 · Emergency On-Call (054-219-9008)',
    tier: 'verified',
    location: { lat: 32.825, lng: 34.988 },
    phone: '054-219-9008',
    rating: 4.9,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-bat-galim-erez',
    name: 'Bat Galim & Kiryat Eliezer Pet Clinic (ד"ר אורי ארז)',
    address: 'Allenby Rd 22, Kiryat Eliezer / Bat Galim, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–18:00 · Fri 09:00–13:00',
    tier: 'unverified',
    location: { lat: 32.822, lng: 34.986 },
    phone: '04-854-1100',
    rating: 4.5,
    capacityStatus: 'accepting',
  },

  // --- DOWNTOWN, HADAR, NEVE SHA'ANAN & REGIONAL ---
  {
    id: 'haifa-vet-center-gelbart',
    name: 'Haifa Veterinary Center (מרכז וטרינרי חיפה - ד"ר לימור גלברט)',
    address: 'Haifa (haifavetcenter.com)',
    isOpenNow: true,
    openingHours: 'Sun–Thu 08:00–11:00, 17:00–19:30 · (054-545-4599)',
    tier: 'verified',
    location: { lat: 32.805, lng: 34.992 },
    phone: '054-545-4599',
    rating: 4.9,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-hadar-ronen',
    name: 'Hadar Community Pet Clinic (מרפאת הדר - ד"ר רונן)',
    address: 'Herzl St 68, Hadar HaCarmel, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 08:30–19:00 · Fri 09:00–13:00',
    tier: 'unverified',
    location: { lat: 32.802, lng: 35.005 },
    phone: '04-862-1100',
    rating: 4.6,
    capacityStatus: 'limited',
  },
  {
    id: 'haifa-neve-shaanan',
    name: "Neve Sha'anan Veterinary Practice (מרפאת נווה שאנן)",
    address: "Trumpeldor Ave 44, Neve Sha'anan, Haifa",
    isOpenNow: true,
    openingHours: 'Sun–Thu 09:00–18:30',
    tier: 'unverified',
    location: { lat: 32.7825, lng: 35.014 },
    phone: '04-822-4411',
    rating: 4.5,
    capacityStatus: 'accepting',
  },
  {
    id: 'haifa-municipal-vet',
    name: 'Haifa Municipal Veterinary Service (השירות הווטרינרי העירוני חיפה)',
    address: 'Abba Hillel Silver St 22, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 08:00–15:30 · Municipal Shelter & Quarantine',
    tier: 'verified',
    location: { lat: 32.793, lng: 35.021 },
    phone: '04-823-6566',
    rating: 4.4,
    capacityStatus: 'accepting',
  },
];
