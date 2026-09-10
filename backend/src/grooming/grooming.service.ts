import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GroomingAppointment,
  GroomingAppointmentDocument,
  GroomingServiceItem,
  GroomingServiceItemDocument,
} from '../schemas/grooming.schema';
import { ReceiptsService } from '../receipts/receipts.service';
import { toSafeString, isSafeObjectId, toSafeObjectId } from '../utils/sanitize';

const INITIAL_GROOMING_SERVICES = [
  {
    name: 'Full Royal Breed Groom & Styling',
    category: 'full_groom',
    price: 180,
    durationMinutes: 75,
    description:
      'Precision scissor cut, warm hydro-bath, organic shampoo, blowout, sanitary trim & paw pad balm.',
  },
  {
    name: 'Bath, Blow-Dry & De-Shedding Treatment',
    category: 'bath_brush',
    price: 120,
    durationMinutes: 50,
    description:
      'Deep coat undercoat rake, hypoallergenic blueberry facial, blowout and aromatic spritz.',
  },
  {
    name: 'Medical Flea, Tick & Medicated Skin Bath',
    category: 'specialty',
    price: 145,
    durationMinutes: 60,
    description:
      'Veterinary antiparasitic cleansing soak with aloe vera soothe for sensitive & irritated skin.',
  },
  {
    name: 'Nail Grinding & Ultrasonic Ear Cleaning',
    category: 'hygiene',
    price: 55,
    durationMinutes: 20,
    description:
      'Painless smooth nail rotary buffing and gentle antiseptic ear canal flush.',
  },
  {
    name: 'Teeth Brushing & Fresh Breath Polish',
    category: 'teeth_ears',
    price: 45,
    durationMinutes: 15,
    description:
      'Enzymatic plaque removal toothpaste application and tartar defense polish.',
  },
];

@Injectable()
export class GroomingService {
  private readonly logger = new Logger(GroomingService.name);
  private inMemoryServices: any[] = [];
  private inMemoryAppointments: any[] = [];

  constructor(
    @InjectModel(GroomingAppointment.name)
    private appointmentModel: Model<GroomingAppointmentDocument>,
    @InjectModel(GroomingServiceItem.name)
    private serviceModel: Model<GroomingServiceItemDocument>,
    private readonly receiptsService: ReceiptsService,
  ) {
    this.inMemoryServices = INITIAL_GROOMING_SERVICES.map((s, i) => ({
      _id: `srv-${i + 1}`,
      groomerId: 'default-groomer',
      ...s,
      isAvailable: true,
    }));
  }

  /**
   * Retrieves active grooming services for a salon/mobile groomer
   */
  async getServices(
    groomerId = 'default-groomer',
  ): Promise<GroomingServiceItem[]> {
    try {
      const dbServices = await this.serviceModel
        .find({ isAvailable: true })
        .exec();
      if (dbServices && dbServices.length > 0) return dbServices;
    } catch {}
    return this.inMemoryServices;
  }

  /**
   * Adds or updates a grooming service
   */
  async createService(
    groomerId: string,
    dto: Partial<GroomingServiceItem>,
  ): Promise<GroomingServiceItem> {
    try {
      return await this.serviceModel.create({ ...dto, groomerId });
    } catch {
      const newSrv = {
        _id: `srv-${Date.now()}`,
        groomerId,
        name: dto.name || 'Custom Grooming Service',
        category: dto.category || 'full_groom',
        price: dto.price || 100,
        durationMinutes: dto.durationMinutes || 45,
        description: dto.description || '',
        isAvailable: true,
      };
      this.inMemoryServices.push(newSrv);
      return newSrv as any;
    }
  }

  /**
   * Retrieves all appointments for groomer schedule
   */
  async getAppointments(
    groomerId = 'default-groomer',
    date?: string,
  ): Promise<GroomingAppointment[]> {
    const safeGroomerId = toSafeString(groomerId);
    const filter: any = {};
    if (safeGroomerId) filter.groomerId = safeGroomerId;
    if (date) filter.appointmentDate = toSafeString(date);

    try {
      const appointments = await this.appointmentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .exec();
      if (appointments && appointments.length > 0) return appointments;
    } catch {}

    return this.inMemoryAppointments;
  }

  /**
   * Retrieves appointments for a specific user
   */
  async getUserAppointments(userId: string): Promise<GroomingAppointment[]> {
    const safeUserId = toSafeString(userId);
    try {
      return await this.appointmentModel
        .find({ userId: safeUserId })
        .sort({ createdAt: -1 })
        .exec();
    } catch {
      return this.inMemoryAppointments.filter((a) => a.userId === safeUserId);
    }
  }

  /**
   * Creates a new grooming appointment booking
   */
  async createAppointment(dto: any): Promise<GroomingAppointment> {
    const services = dto.services || [];
    const totalPrice =
      dto.totalPrice !== undefined
        ? dto.totalPrice
        : services.reduce((sum: number, s: any) => sum + (s.price || 0), 0);

    const payload = {
      ...dto,
      groomerId: toSafeString(dto.groomerId) || 'default-groomer',
      totalPrice,
      status: toSafeString(dto.status) || 'confirmed',
      appointmentDate:
        toSafeString(dto.appointmentDate) || new Date().toISOString().split('T')[0],
      timeSlot: toSafeString(dto.timeSlot) || '10:00 AM',
      coatConditionNotes: toSafeString(dto.coatConditionNotes) || '',
      paymentStatus: 'pending',
    };

    try {
      return await this.appointmentModel.create(payload);
    } catch {
      const newAppt = {
        _id: `appt-${Date.now()}`,
        ...payload,
        createdAt: new Date(),
      };
      this.inMemoryAppointments.unshift(newAppt);
      return newAppt;
    }
  }

  /**
   * Updates appointment status (e.g. 'in_tub', 'styling', 'ready', 'completed')
   */
  async updateStatus(
    id: string,
    status: string,
    coatConditionNotes?: string,
    afterPhotoUrl?: string,
  ): Promise<GroomingAppointment> {
    const safeId = toSafeString(id);
    const updates: any = { status: toSafeString(status) };
    if (coatConditionNotes !== undefined)
      updates.coatConditionNotes = toSafeString(coatConditionNotes);
    if (afterPhotoUrl) updates.afterPhotoUrl = toSafeString(afterPhotoUrl);

    if (isSafeObjectId(safeId)) {
      try {
        const doc = await this.appointmentModel
          .findByIdAndUpdate(toSafeObjectId(safeId), { $set: updates }, { new: true })
          .exec();
        if (doc) return doc;
      } catch {}
    }

    const idx = this.inMemoryAppointments.findIndex((a) => a._id === safeId);
    if (idx !== -1) {
      this.inMemoryAppointments[idx] = {
        ...this.inMemoryAppointments[idx],
        ...updates,
      };
      return this.inMemoryAppointments[idx];
    }

    throw new NotFoundException(`Grooming appointment ${id} not found`);
  }

  /**
   * Issues an official itemized receipt for a completed grooming session
   */
  async issueAppointmentInvoice(id: string): Promise<any> {
    const safeId = toSafeString(id);
    let appt: any;
    if (isSafeObjectId(safeId)) {
      try {
        appt = await this.appointmentModel.findById(toSafeObjectId(safeId)).exec();
      } catch {}
    }

    if (!appt) {
      appt = this.inMemoryAppointments.find((a) => a._id === safeId);
    }

    if (!appt) {
      throw new NotFoundException(`Appointment ${id} not found`);
    }

    const items =
      appt.services && appt.services.length > 0
        ? appt.services.map((s: any) => ({
            name: s.name,
            quantity: 1,
            unitPrice: s.price,
            lineTotal: s.price,
            description: `Grooming Treatment for ${appt.petName} (${appt.petBreed})`,
          }))
        : [
            {
              name: `Professional Grooming Session (${appt.petName})`,
              quantity: 1,
              unitPrice: appt.totalPrice,
              lineTotal: appt.totalPrice,
            },
          ];

    const receipt = await this.receiptsService.createReceipt({
      userId: appt.userId,
      customerName: appt.customerName,
      customerEmail: appt.customerEmail,
      type: 'grooming',
      providerName: 'PetSOS Elite Grooming & Spa Salon',
      providerAddress: 'Moriah Ave 88, Haifa',
      items,
      subtotal: appt.totalPrice / 1.17,
      taxAmount: appt.totalPrice - appt.totalPrice / 1.17,
      total: appt.totalPrice,
      currency: 'ILS',
      paymentMethod: { type: 'stripe' },
      paymentStatus: 'paid',
    });

    await this.updateStatus(id, 'completed');
    return receipt;
  }
}
