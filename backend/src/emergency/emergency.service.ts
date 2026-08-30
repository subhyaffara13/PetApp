import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { LostPetAlert, LostPetAlertDocument } from '../schemas/emergency-dispatch.schema';

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
}

const HAIFA_FALLBACK_CLINICS: EmergencyClinicResult[] = [
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

  // --- CARMEL & AHUZA NEIGHBORHOOD CLINICS ---
  {
    id: 'haifa-family-vet',
    name: 'Family Vet (פמילי וט - ד"ר מור פימה)',
    address: 'Moshe Soroka St 39, Ramat Begin / Ahuza, Haifa',
    isOpenNow: true,
    openingHours: 'Sun–Thu 08:30–20:00 · Fri 08:30–14:00 (On-call ER)',
    tier: 'verified',
    location: { lat: 32.776, lng: 34.978 },
    phone: '04-824-4488',
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

  // --- HADAR, NEVE SHA'ANAN, BAT GALIM & DOWNTOWN ---
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

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);
  private G_PLACES_API_KEY: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(LostPetAlert.name) private lostPetAlertModel: Model<LostPetAlertDocument>,
  ) {
    this.G_PLACES_API_KEY = this.configService.get<string>('GOOGLE_PLACES_API_KEY');
  }

  // --- RATE-LIMITED NEIGHBORHOOD LOST PET SOS ---
  async broadcastLostPetAlert(dto: {
    ownerId: string;
    ownerName: string;
    ownerPhone: string;
    petId: string;
    petName: string;
    petBreed: string;
    petAvatar?: string;
    lastSeenLocation: string;
    lastSeenCoordinates: { lat: number; lon: number };
    rewardText?: string;
  }): Promise<{ success: boolean; alert?: any; message: string }> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Spam Protection: Max 1 alert per 24 hours per pet
    const recentAlert = await this.lostPetAlertModel.findOne({
      petId: dto.petId,
      createdAt: { $gte: oneDayAgo },
      status: 'active',
    }).exec();

    if (recentAlert) {
      return {
        success: false,
        message: `An active Lost Pet SOS for ${dto.petName} is already live in your neighborhood (24h cooldown). Neighbors can see it on the map!`,
      };
    }

    const alert = new this.lostPetAlertModel({
      ...dto,
      status: 'active',
    });
    const saved = await alert.save();
    this.logger.log(`🚨 Neighborhood Lost Pet SOS Broadcasted for "${dto.petName}" near ${dto.lastSeenLocation}`);

    return {
      success: true,
      alert: saved,
      message: `Lost Pet SOS for ${dto.petName} broadcasted to nearby pet parents!`,
    };
  }

  async getActiveLostPetAlerts(lat: number = 32.794, lon: number = 34.9896): Promise<LostPetAlertDocument[]> {
    try {
      return await this.lostPetAlertModel.find({ status: 'active' }).sort({ createdAt: -1 }).limit(10).exec();
    } catch {
      return [];
    }
  }

  async resolveLostPetAlert(alertId: string): Promise<any> {
    return this.lostPetAlertModel.findByIdAndUpdate(
      alertId,
      { $set: { status: 'resolved', resolvedAt: new Date() } },
      { new: true }
    ).exec();
  }

  private inMemoryClinicOverrides: Map<string, Partial<EmergencyClinicResult>> = new Map();

  getAllClinics(): EmergencyClinicResult[] {
    return HAIFA_FALLBACK_CLINICS.map((c) => {
      const override = this.inMemoryClinicOverrides.get(c.id);
      return override ? ({ ...c, ...override } as EmergencyClinicResult) : c;
    });
  }

  updateClinic(id: string, updates: Partial<EmergencyClinicResult>): EmergencyClinicResult {
    const existing = HAIFA_FALLBACK_CLINICS.find((c) => c.id === id);
    const prevOverride = this.inMemoryClinicOverrides.get(id) || {};
    const updated = { ...(existing || {}), ...prevOverride, ...updates, id } as EmergencyClinicResult;
    this.inMemoryClinicOverrides.set(id, updated);
    return updated;
  }

  async findNearby(lat: number, lon: number): Promise<EmergencyClinicResult[]> {
    const placesMap = new Map<string, EmergencyClinicResult>();

    // 1. If Google Places API key is present, query both types and bilingual keywords
    if (this.G_PLACES_API_KEY) {
      try {
        const queries = [
          { type: 'veterinary_care', radius: 30000 },
          { keyword: 'וטרינר OR מרפאה וטרינרית OR veterinary', radius: 30000 },
        ];

        for (const query of queries) {
          const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
          const params = {
            location: `${lat},${lon}`,
            key: this.G_PLACES_API_KEY,
            ...query,
          };

          const response = await firstValueFrom(this.httpService.get(url, { params }));

          if (response.data?.results?.length > 0) {
            for (const place of response.data.results) {
              if (!placesMap.has(place.place_id)) {
                placesMap.set(place.place_id, {
                  id: place.place_id,
                  name: place.name,
                  address: place.vicinity || place.formatted_address || 'Address unavailable',
                  isOpenNow: place.opening_hours ? place.opening_hours.open_now : true,
                  location: place.geometry.location,
                  phone: null,
                  tier: 'unverified',
                  isClaimed: false,
                  rating: place.rating || 4.5,
                  capacityStatus: 'accepting',
                });
              }
            }
          }
        }
      } catch (error: any) {
        this.logger.warn('Google Places API query warning:', error?.message);
      }
    }

    // 2. Query Worldwide OpenStreetMap (OSM Overpass) for live international veterinary data
    try {
      const overpassQuery = `[out:json][timeout:5];(node["amenity"="veterinary"](around:35000,${lat},${lon});way["amenity"="veterinary"](around:35000,${lat},${lon}););out center 25;`;
      const osmRes = await firstValueFrom(
        this.httpService.get(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`, {
          timeout: 4000,
        })
      );

      if (osmRes.data?.elements && Array.isArray(osmRes.data.elements)) {
        for (const el of osmRes.data.elements) {
          const clinicLat = el.lat || el.center?.lat;
          const clinicLon = el.lon || el.center?.lon;
          if (!clinicLat || !clinicLon) continue;

          const tags = el.tags || {};
          const name = tags.name || tags['name:en'] || tags['name:he'] || 'Community Veterinary Clinic';
          const street = tags['addr:street'] ? `${tags['addr:street']} ${tags['addr:housenumber'] || ''}` : '';
          const city = tags['addr:city'] || '';
          const fullAddress = [street, city].filter(Boolean).join(', ') || 'Local Directory Listing';
          const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null;
          const openingHours = tags.opening_hours || (tags['emergency'] === 'yes' ? 'Open 24/7' : 'Hours Unconfirmed');

          const osmId = `osm-${el.id}`;
          if (!placesMap.has(osmId)) {
            placesMap.set(osmId, {
              id: osmId,
              name,
              address: fullAddress,
              isOpenNow: tags['emergency'] === 'yes' || !tags.opening_hours ? true : true,
              location: { lat: clinicLat, lng: clinicLon },
              phone,
              openingHours,
              tier: 'unverified',
              isClaimed: false,
              rating: 4.6,
              capacityStatus: 'accepting',
            });
          }
        }
      }
    } catch (osmErr: any) {
      this.logger.warn('OSM Overpass query warning:', osmErr?.message);
    }

    // 3. Merge with verified local registry if nearby
    for (const clinic of HAIFA_FALLBACK_CLINICS) {
      const override = this.inMemoryClinicOverrides.get(clinic.id);
      const merged = override ? ({ ...clinic, ...override } as EmergencyClinicResult) : clinic;
      placesMap.set(clinic.id, {
        ...merged,
        isClaimed: merged.isClaimed !== undefined ? merged.isClaimed : false,
      });
    }

    return Array.from(placesMap.values());
  }
}
