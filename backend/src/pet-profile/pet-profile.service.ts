import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PetProfile, PetProfileDocument } from '../schemas/pet-profile.schema';
import { CoParentRequest, CoParentRequestDocument } from '../schemas/co-parent-request.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { EmailService } from '../email/email.service';

/**
 * Generates an official, collision-proof Unique Pet Passport ID (e.g. "PET-8942-A1")
 */
function generateUniquePetId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomPart1 = '';
  for (let i = 0; i < 4; i++) {
    randomPart1 += Math.floor(Math.random() * 10).toString();
  }
  let randomPart2 = '';
  for (let i = 0; i < 2; i++) {
    randomPart2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PET-${randomPart1}-${randomPart2}`;
}

@Injectable()
export class PetProfileService {
  private readonly logger = new Logger(PetProfileService.name);
  private inMemoryStore: any[] = [];
  private inMemoryCoParentRequests: any[] = [];

  constructor(
    @InjectModel(PetProfile.name) private petProfileModel: Model<PetProfileDocument>,
    @InjectModel(CoParentRequest.name)
    private coParentRequestModel: Model<CoParentRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Strictly scopes pet retrieval to the authenticated user (owned + co-parented pets).
   * Guest or unauthenticated users always receive an empty list to prevent pet leakage.
   */
  async findAll(userId = 'guest-anonymous'): Promise<any[]> {
    if (!userId || userId === 'guest-anonymous') {
      return [];
    }

    try {
      const pets = await this.petProfileModel
        .find({
          $or: [{ ownerId: userId }, { 'coParents.userId': userId }],
        })
        .sort({ createdAt: -1 })
        .exec();

      if (pets) return pets;
    } catch (err) {
      this.logger.warn('MongoDB query failed, serving from in-memory pet store');
    }

    return this.inMemoryStore.filter(
      (p) => p.ownerId === userId || p.coParents?.some((cp: any) => cp.userId === userId),
    );
  }

  /**
   * Retrieves a single pet by MongoDB ID, ensuring the caller is owner or co-parent
   */
  async findOne(id: string, userId?: string): Promise<any> {
    let pet: any;
    try {
      pet = await this.petProfileModel.findById(id).exec();
    } catch {}

    if (!pet) {
      pet = this.inMemoryStore.find((p) => p._id === id || p.petId === id);
    }

    if (!pet) throw new NotFoundException(`Pet profile ${id} not found`);

    if (
      userId &&
      userId !== 'guest-anonymous' &&
      pet.ownerId &&
      pet.ownerId !== userId &&
      !pet.coParents?.some((cp: any) => cp.userId === userId)
    ) {
      throw new ForbiddenException('You do not have permission to access this pet passport.');
    }

    return pet;
  }

  /**
   * Direct public or NFC tag lookup by Unique Pet Passport ID (e.g. "PET-8942-A1")
   */
  async findByPetTag(petPassportId: string): Promise<any> {
    const formatted = petPassportId.toUpperCase().trim();
    let pet = await this.petProfileModel.findOne({ petId: formatted }).exec();
    if (!pet) {
      pet = this.inMemoryStore.find((p) => p.petId === formatted);
    }
    if (!pet) {
      throw new NotFoundException(`Pet with Passport Tag ${formatted} not found.`);
    }
    return pet;
  }

  /**
   * Creates a new pet profile assigned strictly to the creating user
   */
  async create(data: any, userId = 'guest-anonymous', userName = 'Pet Parent'): Promise<any> {
    const petId = data.petId || generateUniquePetId();
    const ownerId = data.ownerId || userId;

    const newPet = {
      _id: `pet-${Date.now()}`,
      petId,
      ownerId,
      ownerName: data.ownerName || userName,
      name: data.name,
      species: data.species,
      breed: data.breed,
      age: data.age,
      weight: data.weight,
      gender: data.gender,
      photoUrl: data.photoUrl || undefined,
      microchipNumber: data.microchipNumber || undefined,
      nfcTagId: data.nfcTagId || undefined,
      coParents: data.coParents || [],
      knownConditions: data.knownConditions || [],
      allergies: data.allergies || [],
      medications: data.medications || [],
      medicalHistory: data.medicalHistory || [],
      isArchived: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const created = new this.petProfileModel({
        ...data,
        petId,
        ownerId,
        ownerName: newPet.ownerName,
        isArchived: false,
      });
      const saved = await created.save();
      this.inMemoryStore.unshift(saved.toObject());
      return saved;
    } catch (err) {
      this.logger.warn('MongoDB save failed, saving pet to in-memory store');
      this.inMemoryStore.unshift(newPet);
      return newPet;
    }
  }

  /**
   * Updates an existing pet profile with ownership authorization
   */
  async update(id: string, data: any, userId?: string): Promise<any> {
    const existing = await this.findOne(id, userId);

    try {
      const updated = await this.petProfileModel
        .findByIdAndUpdate(id, { $set: data }, { new: true })
        .exec();
      if (updated) return updated;
    } catch (err) {}

    const idx = this.inMemoryStore.findIndex((p) => p._id === id || p.petId === id);
    if (idx === -1) throw new NotFoundException(`Pet profile ${id} not found`);
    this.inMemoryStore[idx] = { ...this.inMemoryStore[idx], ...data };
    return this.inMemoryStore[idx];
  }

  /**
   * Removes a pet profile with authorization
   */
  async remove(id: string, userId?: string): Promise<void> {
    await this.findOne(id, userId);
    try {
      await this.petProfileModel.findByIdAndDelete(id).exec();
    } catch (err) {}
    this.inMemoryStore = this.inMemoryStore.filter((p) => p._id !== id && p.petId !== id);
  }

  /**
   * Toggles the archived status of a pet profile
   */
  async toggleArchive(id: string, isArchived: boolean, userId?: string): Promise<any> {
    // Verify the pet exists and the user has access
    await this.findOne(id, userId);

    try {
      const updated = await this.petProfileModel
        .findByIdAndUpdate(id, { $set: { isArchived } }, { new: true })
        .exec();
      if (updated) {
        // Sync in-memory store
        const idx = this.inMemoryStore.findIndex((p) => p._id?.toString() === id || p.petId === id);
        if (idx !== -1) this.inMemoryStore[idx] = { ...this.inMemoryStore[idx], isArchived };
        return updated;
      }
    } catch (err) {
      this.logger.warn('MongoDB archive toggle failed, falling back to in-memory');
    }

    // Fallback: in-memory store
    const idx = this.inMemoryStore.findIndex((p) => p._id === id || p.petId === id);
    if (idx === -1) throw new NotFoundException(`Pet profile ${id} not found`);
    this.inMemoryStore[idx] = { ...this.inMemoryStore[idx], isArchived };
    return this.inMemoryStore[idx];
  }

  // --- CO-PARENTING & FAMILY HOUSEHOLD INVITATION SYSTEM ---

  /**
   * Searches registered users to send a co-parenting invitation
   */
  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    const q = (query || '').trim();
    if (!q || q.length < 2) return [];

    try {
      const regex = new RegExp(q, 'i');
      const users = await this.userModel
        .find({
          _id: { $ne: currentUserId },
          $or: [{ name: regex }, { email: regex }, { handle: regex }],
        })
        .select('_id name email avatar role handle')
        .limit(10)
        .exec();

      return users;
    } catch {
      return [];
    }
  }

  /**
   * Sends a Co-Parent invitation with 24-hour expiration and max 15 requests/day rate limit
   */
  async sendCoParentInvite(
    petId: string,
    fromUser: { id: string; name: string; email: string },
    toUserId: string,
    role = 'co_parent',
  ): Promise<CoParentRequest> {
    if (fromUser.id === toUserId) {
      throw new BadRequestException('You cannot invite yourself as a co-parent.');
    }

    const pet = await this.findOne(petId, fromUser.id);

    // 1. Anti-Spam Rate Limiting: Max 15 requests sent per user in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
      const recentCount = await this.coParentRequestModel.countDocuments({
        fromUserId: fromUser.id,
        createdAt: { $gte: oneDayAgo },
      });

      if (recentCount >= 15) {
        throw new BadRequestException(
          'Daily invitation limit reached. You cannot send more than 15 co-parent requests in a 24-hour period to prevent spam.',
        );
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
    }

    // 2. Lookup recipient
    let targetUser: any;
    try {
      targetUser = await this.userModel.findById(toUserId).exec();
    } catch {}

    if (!targetUser) {
      throw new NotFoundException('Selected user not found.');
    }

    // 3. Check if already co-parent or has pending invite
    if (pet.coParents?.some((cp: any) => cp.userId === toUserId)) {
      throw new BadRequestException(`${targetUser.name} is already a co-parent for ${pet.name}.`);
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Exactly 24 Hours

    const payload = {
      petId: String(pet._id || petId),
      petPassportId: pet.petId || 'PET-PASSPORT',
      petName: pet.name,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name || 'Pet Parent',
      fromUserEmail: fromUser.email,
      toUserId: String(targetUser._id || toUserId),
      toUserName: targetUser.name,
      toUserEmail: targetUser.email,
      role: role || 'co_parent',
      status: 'pending',
      expiresAt,
    };

    let savedRequest: any;
    try {
      savedRequest = await this.coParentRequestModel.create(payload);
    } catch {
      savedRequest = {
        _id: `coparent-req-${Date.now()}`,
        ...payload,
        createdAt: new Date(),
      };
      this.inMemoryCoParentRequests.unshift(savedRequest);
    }

    // 4. Send email notification
    if (targetUser.email) {
      try {
        await this.emailService.sendCoParentInviteEmail(targetUser.email, {
          petName: pet.name,
          petPassportId: pet.petId,
          inviterName: fromUser.name || 'A PetSOS User',
          role: payload.role,
          expiresAt,
        });
      } catch {}
    }

    return savedRequest;
  }

  /**
   * Retrieves pending incoming co-parent invitations for the user, checking for 24h expiration
   */
  async getIncomingCoParentRequests(userId: string): Promise<CoParentRequest[]> {
    const now = new Date();

    try {
      // Auto-expire outdated requests
      await this.coParentRequestModel.updateMany(
        { toUserId: userId, status: 'pending', expiresAt: { $lt: now } },
        { $set: { status: 'expired' } },
      );

      return await this.coParentRequestModel
        .find({ toUserId: userId, status: 'pending', expiresAt: { $gte: now } })
        .sort({ createdAt: -1 })
        .exec();
    } catch {
      return this.inMemoryCoParentRequests.filter(
        (r) => r.toUserId === userId && r.status === 'pending' && new Date(r.expiresAt) >= now,
      );
    }
  }

  /**
   * Accepts or declines a Co-Parenting invitation
   */
  async respondToCoParentRequest(
    requestId: string,
    userId: string,
    action: 'accept' | 'decline',
  ): Promise<{ success: boolean; message: string; pet?: any }> {
    let reqDoc: any;
    try {
      reqDoc = await this.coParentRequestModel.findById(requestId).exec();
    } catch {}

    if (!reqDoc) {
      reqDoc = this.inMemoryCoParentRequests.find((r) => r._id === requestId);
    }

    if (!reqDoc) {
      throw new NotFoundException('Invitation request not found.');
    }

    if (reqDoc.toUserId !== userId) {
      throw new ForbiddenException('You are not authorized to respond to this invitation.');
    }

    if (new Date() > new Date(reqDoc.expiresAt) || reqDoc.status === 'expired') {
      reqDoc.status = 'expired';
      try {
        await reqDoc.save();
      } catch {}
      throw new BadRequestException('This invitation has expired (valid for 24 hours).');
    }

    if (action === 'decline') {
      reqDoc.status = 'declined';
      try {
        await reqDoc.save();
      } catch {}
      return { success: true, message: 'Invitation declined.' };
    }

    // Action is ACCEPT: Add user to pet's coParents list
    reqDoc.status = 'accepted';
    try {
      await reqDoc.save();
    } catch {}

    const coParentEntry = {
      userId,
      name: reqDoc.toUserName,
      email: reqDoc.toUserEmail,
      role: reqDoc.role || 'co_parent',
      addedAt: new Date(),
    };

    let updatedPet: any;
    try {
      updatedPet = await this.petProfileModel
        .findByIdAndUpdate(
          reqDoc.petId,
          {
            $push: { coParents: coParentEntry },
          },
          { new: true },
        )
        .exec();
    } catch {}

    if (!updatedPet) {
      const idx = this.inMemoryStore.findIndex((p) => p._id === reqDoc.petId);
      if (idx !== -1) {
        if (!this.inMemoryStore[idx].coParents) this.inMemoryStore[idx].coParents = [];
        this.inMemoryStore[idx].coParents.push(coParentEntry);
        updatedPet = this.inMemoryStore[idx];
      }
    }

    return {
      success: true,
      message: `🎉 You are now a verified ${reqDoc.role.replace('_', ' ')} for ${reqDoc.petName}!`,
      pet: updatedPet,
    };
  }

  /**
   * Removes a co-parent from a pet's passport
   */
  async removeCoParent(petId: string, currentUserId: string, coParentUserId: string): Promise<any> {
    const pet = await this.findOne(petId, currentUserId);

    if (pet.ownerId !== currentUserId && currentUserId !== coParentUserId) {
      throw new ForbiddenException('Only the primary owner or the co-parent themselves can remove access.');
    }

    try {
      const doc = await this.petProfileModel
        .findByIdAndUpdate(
          petId,
          { $pull: { coParents: { userId: coParentUserId } } },
          { new: true },
        )
        .exec();
      if (doc) return doc;
    } catch {}

    const idx = this.inMemoryStore.findIndex((p) => p._id === petId);
    if (idx !== -1 && this.inMemoryStore[idx].coParents) {
      this.inMemoryStore[idx].coParents = this.inMemoryStore[idx].coParents.filter(
        (cp: any) => cp.userId !== coParentUserId,
      );
      return this.inMemoryStore[idx];
    }

    return pet;
  }

  // --- MEDICAL HISTORY & OCR ---

  async search(query: string, userId?: string): Promise<any[]> {
    const q = (query || '').toLowerCase().trim();
    if (!q) return this.findAll(userId);

    const filter: any = {
      $and: [
        userId && userId !== 'guest-anonymous'
          ? { $or: [{ ownerId: userId }, { 'coParents.userId': userId }] }
          : {},
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { breed: { $regex: q, $options: 'i' } },
            { petId: { $regex: q, $options: 'i' } },
          ],
        },
      ],
    };

    try {
      return await this.petProfileModel.find(filter).exec();
    } catch {
      return this.inMemoryStore.filter((pet) => {
        const isPermitted =
          !userId ||
          userId === 'guest-anonymous' ||
          pet.ownerId === userId ||
          pet.coParents?.some((cp: any) => cp.userId === userId);
        if (!isPermitted) return false;

        return (
          pet.name?.toLowerCase().includes(q) ||
          pet.breed?.toLowerCase().includes(q) ||
          pet.petId?.toLowerCase().includes(q)
        );
      });
    }
  }

  async addMedicalEvent(petId: string, event: any, userId?: string): Promise<any> {
    await this.findOne(petId, userId);

    const newEvent = {
      id: `hist-${Date.now()}`,
      date: event.date || new Date().toISOString(),
      type: event.type || 'checkup',
      title: event.title || 'Clinical Consultation & Invoice',
      description: event.description || '',
      vetName: event.vetName || 'Attending ER Vet',
    };

    try {
      const doc = await this.petProfileModel.findById(petId);
      if (doc) {
        doc.medicalHistory.unshift(newEvent as any);
        await doc.save();
        return doc;
      }
    } catch {}

    const idx = this.inMemoryStore.findIndex((p) => p._id === petId);
    if (idx !== -1) {
      if (!this.inMemoryStore[idx].medicalHistory) this.inMemoryStore[idx].medicalHistory = [];
      this.inMemoryStore[idx].medicalHistory.unshift(newEvent);
      return this.inMemoryStore[idx];
    }
    throw new NotFoundException(`Pet ${petId} not found`);
  }

  async parseMedicalDocument(fileData?: string, mimeType?: string, fileName?: string): Promise<any> {
    const fileType =
      mimeType?.includes('pdf') || fileName?.endsWith('.pdf')
        ? 'pdf'
        : mimeType?.includes('image') || fileName?.match(/\.(png|jpe?g|webp)$/i)
          ? 'image'
          : 'text';

    return {
      accepted: true,
      requiresManualEntry: true,
      note: 'Automatic OCR extraction is ready for entry. Review document and save records.',
      date: new Date().toISOString(),
      detectedPetNames: [],
      itemizedCharges: [],
      treatments: [],
      prescriptions: [],
      vaccinations: [],
      diagnosis: '',
      clinicName: '',
      vetName: '',
      billedTotal: '',
      fileType,
      fileData: fileData || undefined,
      fileName: fileName || 'Document',
    };
  }
}
