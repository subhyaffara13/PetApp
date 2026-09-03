import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import {
  AdoptablePet,
  AdoptablePetDocument,
} from '../schemas/adoptable-pet.schema';

export interface ShelterResult {
  id: string;
  name: string;
  address: string;
  country: string;
  countryCode: string;
  location: { lat: number; lng: number };
  phone: string | null;
  website: string | null;
  rating?: number;
  source: 'google' | 'registry';
  distanceKm?: number;
}

export interface CountryEntry {
  name: string;
  iso2: string;
  flag: string;
  city: string;
  coords: { lat: number; lng: number };
}

interface RegistryEntry {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  coords: { lat: number; lng: number };
}

// Reference capitals / major cities used to pick target coordinates when the
// client does not provide its own lat/lng for a given country.
const COUNTRIES: CountryEntry[] = [
  {
    name: 'israel',
    iso2: 'il',
    flag: '🇮🇱',
    city: 'Tel Aviv',
    coords: { lat: 32.0853, lng: 34.7818 },
  },
  {
    name: 'united states',
    iso2: 'us',
    flag: '🇺🇸',
    city: 'New York',
    coords: { lat: 40.7128, lng: -74.006 },
  },
  {
    name: 'united kingdom',
    iso2: 'gb',
    flag: '🇬🇧',
    city: 'London',
    coords: { lat: 51.5074, lng: -0.1278 },
  },
  {
    name: 'canada',
    iso2: 'ca',
    flag: '🇨🇦',
    city: 'Toronto',
    coords: { lat: 43.6532, lng: -79.3832 },
  },
  {
    name: 'germany',
    iso2: 'de',
    flag: '🇩🇪',
    city: 'Berlin',
    coords: { lat: 52.52, lng: 13.405 },
  },
  {
    name: 'france',
    iso2: 'fr',
    flag: '🇫🇷',
    city: 'Paris',
    coords: { lat: 48.8566, lng: 2.3522 },
  },
  {
    name: 'spain',
    iso2: 'es',
    flag: '🇪🇸',
    city: 'Madrid',
    coords: { lat: 40.4168, lng: -3.7038 },
  },
  {
    name: 'italy',
    iso2: 'it',
    flag: '🇮🇹',
    city: 'Rome',
    coords: { lat: 41.9028, lng: 12.4964 },
  },
  {
    name: 'netherlands',
    iso2: 'nl',
    flag: '🇳🇱',
    city: 'Amsterdam',
    coords: { lat: 52.3676, lng: 4.9041 },
  },
  {
    name: 'sweden',
    iso2: 'se',
    flag: '🇸🇪',
    city: 'Stockholm',
    coords: { lat: 59.3293, lng: 18.0686 },
  },
  {
    name: 'australia',
    iso2: 'au',
    flag: '🇦🇺',
    city: 'Sydney',
    coords: { lat: -33.8688, lng: 151.2093 },
  },
  {
    name: 'india',
    iso2: 'in',
    flag: '🇮🇳',
    city: 'New Delhi',
    coords: { lat: 28.6139, lng: 77.209 },
  },
  {
    name: 'brazil',
    iso2: 'br',
    flag: '🇧🇷',
    city: 'São Paulo',
    coords: { lat: -23.5505, lng: -46.6333 },
  },
  {
    name: 'japan',
    iso2: 'jp',
    flag: '🇯🇵',
    city: 'Tokyo',
    coords: { lat: 35.6762, lng: 139.6503 },
  },
  {
    name: 'turkey',
    iso2: 'tr',
    flag: '🇹🇷',
    city: 'Istanbul',
    coords: { lat: 41.0082, lng: 28.9784 },
  },
  {
    name: 'south africa',
    iso2: 'za',
    flag: '🇿🇦',
    city: 'Cape Town',
    coords: { lat: -33.9249, lng: 18.4241 },
  },
];

// Curated registry of well-known local shelters & rescues per country.
// Ensures useful results even without a Google Places API key. "צער בעלי חיים"
// (Tza'ar Ba'alei Chayim / SPCA Israel) is included for Israel.
const REGISTRY: RegistryEntry[] = [
  // --- Israel ---
  {
    id: 'il-spca-rishon',
    name: 'SPCA ISRAEL – Rishon LeZion (צער בעלי חיים)',
    address: '1 Hakishon St, Rishon LeZion',
    phone: '+972-3-963-3564',
    website: 'https://www.spca.co.il',
    coords: { lat: 31.9823, lng: 34.8011 },
  },
  {
    id: 'il-tzaar-jerusalem',
    name: 'Jerusalem Society for Prevention of Cruelty to Animals (צער בעלי חיים, ירושלים)',
    address: '30 Sinai Rd, Jerusalem',
    phone: '+972-2-586-5828',
    website: 'https://www.israelanimal.org',
    coords: { lat: 31.7613, lng: 35.2081 },
  },
  {
    id: 'il-spca-haifa',
    name: 'SPCA Haifa Municipal Shelter',
    address: 'Allenby St 22, Haifa',
    phone: '+972-4-823-6566',
    website: null,
    coords: { lat: 32.822, lng: 34.986 },
  },
  {
    id: 'il-animal-justice',
    name: 'Let the Animals Live (תנו לחיות לחיות)',
    address: 'Tel Aviv',
    phone: '+972-3-669-0148',
    website: 'https://www.tlv.org',
    coords: { lat: 32.0853, lng: 34.7818 },
  },
  // --- United States ---
  {
    id: 'us-aspca',
    name: 'ASPCA',
    address: '424 E 92nd St, New York, NY 10128',
    phone: '+1-212-876-7700',
    website: 'https://www.aspca.org',
    coords: { lat: 40.7799, lng: -73.9469 },
  },
  {
    id: 'us-humane-society',
    name: 'The Humane Society of the United States',
    address: '1255 23rd St NW, Washington, DC',
    phone: '+1-202-452-1100',
    website: 'https://www.humanesociety.org',
    coords: { lat: 38.8993, lng: -77.0449 },
  },
  {
    id: 'us-bideawee',
    name: 'Bideawee',
    address: '410 E 38th St, New York, NY',
    phone: '+1-212-532-4455',
    website: 'https://www.bideawee.org',
    coords: { lat: 40.7469, lng: -73.972 },
  },
  // --- United Kingdom ---
  {
    id: 'gb-rspca',
    name: 'RSPCA',
    address: 'Wilberforce Way, Southwater, Horsham',
    phone: '+44-300-1234-999',
    website: 'https://www.rspca.org.uk',
    coords: { lat: 51.0315, lng: -0.3033 },
  },
  {
    id: 'gb-battersea',
    name: 'Battersea Dogs & Cats Home',
    address: '4 Battersea Park Rd, London SW8 4AA',
    phone: '+44-20-7627-9209',
    website: 'https://www.battersea.org.uk',
    coords: { lat: 51.4788, lng: -0.1517 },
  },
  {
    id: 'gb-dogstrust',
    name: 'Dogs Trust',
    address: '17 Wakley St, London EC1V 7RQ',
    phone: '+44-20-7837-0006',
    website: 'https://www.dogstrust.org.uk',
    coords: { lat: 51.5287, lng: -0.102 },
  },
  // --- Canada ---
  {
    id: 'ca-ontario-spca',
    name: 'Ontario SPCA and Humane Society',
    address: '16586 Woodbine Ave, Stouffville, ON',
    phone: '+1-888-668-7722',
    website: 'https://ontariospca.ca',
    coords: { lat: 43.9721, lng: -79.4088 },
  },
  {
    id: 'ca-humane-toronto',
    name: 'Toronto Humane Society',
    address: '11 River St, Toronto, ON M5A 4C2',
    phone: '+1-416-392-2273',
    website: 'https://www.torontohumanesociety.com',
    coords: { lat: 43.6528, lng: -79.3644 },
  },
  {
    id: 'ca-bc-spca',
    name: 'BC SPCA',
    address: '1245 E 7th Ave, Vancouver, BC',
    phone: '+1-604-879-7721',
    website: 'https://spca.bc.ca',
    coords: { lat: 49.2638, lng: -123.0757 },
  },
  // --- Germany ---
  {
    id: 'de-tierheim-berlin',
    name: 'Tierheim Berlin',
    address: 'Hausvaterweg 39, 13057 Berlin',
    phone: '+49-30-768880',
    website: 'https://www.tierheim-berlin.de',
    coords: { lat: 52.5434, lng: 13.5419 },
  },
  {
    id: 'de-muenchen-tierheim',
    name: 'Tierschutzverein München',
    address: 'Stefan-Meier-Str. 6, 79104 Freiburg',
    phone: '+49-89-130570',
    website: 'https://www.tierschutzverein-muenchen.de',
    coords: { lat: 48.1589, lng: 11.5602 },
  },
  // --- France ---
  {
    id: 'fr-spa-paris',
    name: 'SPA – Société Protectrice des Animaux (Paris)',
    address: '39 Bld Berthier, 75017 Paris',
    phone: '+33-1-43-80-40-66',
    website: 'https://www.la-spa.fr',
    coords: { lat: 48.887, lng: 2.3186 },
  },
  {
    id: 'fr-30-millions',
    name: 'Fondation 30 Millions d’Amis',
    address: '40 Rue du Colisée, 75008 Paris',
    phone: '+33-1-45-20-30-00',
    website: 'https://www.30millionsdamis.fr',
    coords: { lat: 48.8718, lng: 2.309 },
  },
  // --- Spain ---
  {
    id: 'es-fundacion-affinity',
    name: 'Fundación Affinity',
    address: 'Sant Joan Despí, Barcelona',
    phone: '+34-93-473-24-00',
    website: 'https://www.fundacion-affinity.org',
    coords: { lat: 41.383, lng: 2.049 },
  },
  {
    id: 'es-el-refugio',
    name: 'El Refugio',
    address: 'Ctra. de Algete 38, 28702 Madrid',
    phone: '+34-91-650-34-79',
    website: 'https://www.elrefugio.org',
    coords: { lat: 40.4615, lng: -3.6104 },
  },
  // --- Italy ---
  {
    id: 'it-enpa',
    name: 'ENPA (Ente Nazionale Protezione Animali)',
    address: 'Via Attilio Regolo 63, Roma',
    phone: '+39-06-3750-2186',
    website: 'http://www.enpa.it',
    coords: { lat: 41.8971, lng: 12.4778 },
  },
  // --- Netherlands ---
  {
    id: 'nl-dierenbescherming',
    name: 'Dierenbescherming (The Dutch Society for the Protection of Animals)',
    address: 'Scheveningseweg 60, 2517 KW Den Haag',
    phone: '+31-70-314-2400',
    website: 'https://www.dierenbescherming.nl',
    coords: { lat: 52.0913, lng: 4.2999 },
  },
  // --- Sweden ---
  {
    id: 'se-svenska-djurskyddsforeningen',
    name: 'Svenska Djurskyddsföreningen',
    address: 'Stockholm',
    phone: '+46-8-30-19-90',
    website: 'https://www.sdjurskydd.com',
    coords: { lat: 59.3293, lng: 18.0686 },
  },
  // --- Australia ---
  {
    id: 'au-rspca-australia',
    name: 'RSPCA Australia',
    address: '7/1 Moore St, Canberra ACT',
    phone: '+61-2-6282-8300',
    website: 'https://www.rspca.org.au',
    coords: { lat: -35.2809, lng: 149.13 },
  },
  {
    id: 'au-awl-qld',
    name: 'Animal Welfare League Queensland',
    address: '139 Wacol Station Rd, QLD 4076',
    phone: '+61-7-5509-9000',
    website: 'https://www.awlqld.com.au',
    coords: { lat: -27.591, lng: 152.9254 },
  },
  // --- India ---
  {
    id: 'in-bluecross',
    name: 'Blue Cross of India',
    address: '1 Eldams Rd, Teynampet, Chennai',
    phone: '+91-44-6325-7655',
    website: 'https://www.bluecross.org.in',
    coords: { lat: 13.0366, lng: 80.2319 },
  },
  {
    id: 'in-people-animals',
    name: 'People for Animals',
    address: 'B-101, Okhla Phase-II, New Delhi',
    phone: '+91-98111-65547',
    website: 'http://www.peopleforanimalsindia.org',
    coords: { lat: 28.5324, lng: 77.2635 },
  },
  // --- Brazil ---
  {
    id: 'br-suipa',
    name: 'SUIPA (Sociedade União Internacional Protetora dos Animais)',
    address: 'Av. Dom Hélder Câmara, Rio de Janeiro',
    phone: '+55-21-3325-8730',
    website: 'http://www.suipa.org.br',
    coords: { lat: -22.8719, lng: -43.2796 },
  },
  {
    id: 'br-amar-animal',
    name: 'Amor de Bicho (SP)',
    address: 'São Paulo',
    phone: '+55-11-5055-3144',
    website: 'https://www.amordebicho.com.br',
    coords: { lat: -23.5927, lng: -46.6416 },
  },
  // --- Japan ---
  {
    id: 'jp-tokyo-ark',
    name: 'Tokyo Animal Rescue & Crisis (ARK)',
    address: '2-8-17 Nishi-Gotanda, Shinagawa, Tokyo',
    phone: '+81-3-5739-1543',
    website: 'https://www.arkbark.net',
    coords: { lat: 35.6264, lng: 139.7217 },
  },
  // --- Turkey ---
  {
    id: 'tr-haytap',
    name: 'HAYTAP (Turkish Animal Rights Federation)',
    address: 'Caferağa Mah, Moda Cad, Kadıköy, İstanbul',
    phone: '+90-216-418-1446',
    website: 'https://www.haytap.org',
    coords: { lat: 40.9903, lng: 29.0253 },
  },
  // --- South Africa ---
  {
    id: 'za-spca-cape',
    name: 'Cape of Good Hope SPCA',
    address: '2 Peterson St, Grassy Park, Cape Town',
    phone: '+27-21-700-4158',
    website: 'https://spca-ct.co.za',
    coords: { lat: -34.0454, lng: 18.4851 },
  },
];

@Injectable()
export class SheltersService implements OnModuleInit {
  private readonly logger = new Logger(SheltersService.name);
  private G_PLACES_API_KEY: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(AdoptablePet.name)
    private adoptablePetModel: Model<AdoptablePetDocument>,
  ) {
    this.G_PLACES_API_KEY = this.configService.get<string>(
      'GOOGLE_PLACES_API_KEY',
    );
  }

  async onModuleInit() {
    try {
      const count = await this.adoptablePetModel.countDocuments();
      if (count === 0) {
        this.logger.log('Seeding initial Adoptable Pets to MongoDB Atlas...');
        const initialPets = [
          {
            name: 'Bella',
            species: 'dog',
            breed: 'Labrador & Golden Mix',
            age: '1.5 years',
            gender: 'female',
            avatar:
              'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&auto=format&fit=crop&q=80',
            shelterId: 'shelter-haifa-1',
            shelterName: 'SOS Pets Israel (Haifa Branch)',
            shelterPhone: '+972-4-838-8900',
            locationCity: 'Haifa',
            story:
              'Rescued near Carmel Forest. Very gentle, house-trained, loves playing fetch and cuddles with kids.',
            isVaccinated: true,
            isNeutered: true,
            goodWithKids: true,
            status: 'available',
          },
          {
            name: 'Milo',
            species: 'cat',
            breed: 'British Shorthair Mix',
            age: '8 months',
            gender: 'male',
            avatar:
              'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&auto=format&fit=crop&q=80',
            shelterId: 'shelter-haifa-2',
            shelterName: 'Haifa Animal Rescue & Foster Care',
            shelterPhone: '+972-4-838-8888',
            locationCity: 'Haifa',
            story:
              'Playful and purrs constantly. Vaccinated and ready for a loving indoor home.',
            isVaccinated: true,
            isNeutered: true,
            goodWithKids: true,
            status: 'available',
          },
        ];

        for (const p of initialPets) {
          await this.adoptablePetModel.create(p);
        }
        this.logger.log('Adoptable Pets seeded successfully.');
      }
    } catch (err: any) {
      this.logger.warn('Adoptable pets seeding notice:', err?.message);
    }
  }

  async getAdoptablePets(query?: {
    species?: string;
    status?: string;
    city?: string;
  }): Promise<AdoptablePetDocument[]> {
    const filter: any = {};
    if (query?.species && query.species !== 'all')
      filter.species = query.species;
    if (query?.status) filter.status = query.status;
    if (query?.city) filter.locationCity = new RegExp(query.city, 'i');
    return this.adoptablePetModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async createAdoptablePet(dto: any): Promise<AdoptablePetDocument> {
    const pet = new this.adoptablePetModel(dto);
    return pet.save();
  }

  async updateAdoptablePet(
    id: string,
    dto: any,
  ): Promise<AdoptablePetDocument | null> {
    return this.adoptablePetModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .exec();
  }

  private normalizeCountry(value?: string): CountryEntry | null {
    if (!value) return null;
    const v = value.trim().toLowerCase();
    return (
      COUNTRIES.find((c) => c.iso2 === v) ||
      COUNTRIES.find((c) => c.name === v) ||
      COUNTRIES.find((c) => c.name.includes(v)) ||
      null
    );
  }

  private haversineKm(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ): number {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const la1 = (a.lat * Math.PI) / 180;
    const la2 = (b.lat * Math.PI) / 180;
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  private registryForCountry(country: CountryEntry | null): ShelterResult[] {
    const entries = country
      ? REGISTRY.filter((r) => r.id.startsWith(`${country.iso2}-`))
      : REGISTRY;
    return entries.map((r) => {
      const cc = r.id.split('-')[0];
      const known = COUNTRIES.find((c) => c.iso2 === cc);
      const distanceKm = country
        ? Math.round(this.haversineKm(r.coords, country.coords))
        : undefined;
      return {
        id: r.id,
        name: r.name,
        address: r.address,
        country: known?.name || cc,
        countryCode: cc,
        location: r.coords,
        phone: r.phone,
        website: r.website,
        source: 'registry' as const,
        distanceKm,
      };
    });
  }

  async find(geo: {
    lat?: number;
    lon?: number;
    query?: string;
    country?: string;
  }): Promise<ShelterResult[]> {
    const country = this.normalizeCountry(geo.country);
    const targetLat = geo.lat ?? country?.coords.lat ?? 32.0853;
    const targetLon = geo.lon ?? country?.coords.lng ?? 34.7818;

    const fromGoogle: ShelterResult[] = [];
    if (this.G_PLACES_API_KEY) {
      try {
        const url =
          'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
        const params: Record<string, unknown> = {
          location: `${targetLat},${targetLon}`,
          radius: 50000,
          type: 'animal_shelter',
          key: this.G_PLACES_API_KEY,
        };
        const response = await firstValueFrom(
          this.httpService.get(url, { params }),
        );
        const results = response.data?.results || [];
        for (const place of results) {
          fromGoogle.push({
            id: `g-${place.place_id}`,
            name: place.name || 'Local shelter',
            address:
              place.vicinity ||
              place.formatted_address ||
              'Address unavailable',
            country: country?.name || '--',
            countryCode: country?.iso2 || '--',
            location: place.geometry?.location || {
              lat: targetLat,
              lng: targetLon,
            },
            phone: null,
            website: null,
            rating: place.rating || undefined,
            source: 'google' as const,
            distanceKm: Math.round(
              this.haversineKm(
                place.geometry?.location || { lat: targetLat, lng: targetLon },
                { lat: targetLat, lng: targetLon },
              ),
            ),
          });
        }
      } catch (error) {
        this.logger.warn('Google Places shelter lookup failed', error?.message);
      }
    }

    // Registry shelters scoped to the selected country (fallback + enrichment).
    const fromRegistry = this.registryForCountry(country);

    const merged = [...fromGoogle, ...fromRegistry];

    // Optional free-text filter against name/address.
    let filtered = merged;
    if (geo.query?.trim()) {
      const q = geo.query.trim().toLowerCase();
      filtered = merged.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q),
      );
    }

    // Sort by distance from the target point (location-relevant first).
    const sortPoint = { lat: targetLat, lng: targetLon };
    return filtered.sort((a, b) => {
      const da = a.distanceKm ?? this.haversineKm(a.location, sortPoint);
      const db = b.distanceKm ?? this.haversineKm(b.location, sortPoint);
      return da - db;
    });
  }

  listCountries(): CountryEntry[] {
    return COUNTRIES.map((c) => ({
      name: c.name,
      iso2: c.iso2,
      flag: c.flag,
      city: c.city,
      coords: c.coords,
    }));
  }
}
