import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Receipt, ReceiptDocument } from '../schemas/receipt.schema';
import { EmailService } from '../email/email.service';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Creates an itemized receipt in the database and dispatches confirmation email
   */
  async createReceipt(data: Partial<Receipt>): Promise<Receipt> {
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = data.receiptNumber || `REC-${year}-${randomSuffix}`;

    const items = data.items || [];
    const subtotal =
      data.subtotal !== undefined
        ? data.subtotal
        : items.reduce((sum, item) => sum + item.lineTotal, 0);
    const taxRate = data.taxRate !== undefined ? data.taxRate : 0.17;
    const taxAmount =
      data.taxAmount !== undefined ? data.taxAmount : subtotal * taxRate;
    const deliveryFee = data.deliveryFee || 0;
    const discountAmount = data.discountAmount || 0;
    const total =
      data.total !== undefined
        ? data.total
        : subtotal + taxAmount + deliveryFee - discountAmount;

    const receiptPayload = {
      ...data,
      receiptNumber,
      subtotal,
      taxRate,
      taxAmount,
      deliveryFee,
      discountAmount,
      total,
      currency: data.currency || 'ILS',
      paidAt: data.paidAt || new Date(),
    };

    let savedReceipt: ReceiptDocument;
    try {
      savedReceipt = await this.receiptModel.create(receiptPayload);
      this.logger.log(
        `Itemized Receipt ${receiptNumber} saved to profile of ${data.customerEmail}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to save receipt to database: ${err?.message}`);
      savedReceipt = receiptPayload as any;
    }

    // Dispatch official email receipt
    if (data.customerEmail) {
      try {
        await this.emailService.sendItemizedReceiptEmail(data.customerEmail, {
          receiptNumber,
          customerName: data.customerName || 'Valued Customer',
          providerName: data.providerName || 'PetSOS Service',
          providerAddress: data.providerAddress,
          type: data.type || 'marketplace',
          items: items.map((i) => ({
            name: i.name,
            quantity: i.quantity || 1,
            unitPrice: i.unitPrice,
            lineTotal: i.lineTotal,
            description: i.description,
          })),
          subtotal,
          taxRate,
          taxAmount,
          deliveryFee,
          discountAmount,
          total,
          currency: data.currency || 'ILS',
          paymentMethod: data.paymentMethod,
          paidAt: receiptPayload.paidAt,
        });
      } catch (emailErr: any) {
        this.logger.warn(`Failed to send receipt email: ${emailErr?.message}`);
      }
    }

    return savedReceipt;
  }

  /**
   * Retrieves all itemized receipts for a specific user profile
   */
  async findByUser(userId: string, email?: string): Promise<Receipt[]> {
    try {
      const query: any = {
        $or: [
          { userId },
          ...(email ? [{ customerEmail: email.toLowerCase().trim() }] : []),
        ],
      };
      return await this.receiptModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(100)
        .exec();
    } catch (err) {
      this.logger.warn(`Receipt query fallback: ${err}`);
      return [];
    }
  }

  /**
   * Gets a specific receipt by ID or Receipt Number
   */
  async findOne(idOrNumber: string): Promise<Receipt> {
    const isNumber = idOrNumber.startsWith('REC-');
    const query = isNumber
      ? { receiptNumber: idOrNumber }
      : { _id: idOrNumber };
    const receipt = await this.receiptModel.findOne(query).exec();
    if (!receipt) {
      throw new NotFoundException(`Receipt ${idOrNumber} not found`);
    }
    return receipt;
  }
}
