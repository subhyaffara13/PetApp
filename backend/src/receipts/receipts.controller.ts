import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('receipts')
@UseGuards(OptionalJwtAuthGuard)
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get('my-receipts')
  async getMyReceipts(@Req() req: any) {
    const userId = req.user?.id || 'guest-anonymous';
    const email = req.user?.email;
    return this.receiptsService.findByUser(userId, email);
  }

  @Get(':idOrNumber')
  async getReceipt(@Param('idOrNumber') idOrNumber: string) {
    return this.receiptsService.findOne(idOrNumber);
  }

  @Post('create')
  async createReceipt(@Req() req: any, @Body() body: any) {
    const userId = req.user?.id || body.userId || 'guest-anonymous';
    const customerEmail = req.user?.email || body.customerEmail;
    return this.receiptsService.createReceipt({
      ...body,
      userId,
      customerEmail,
    });
  }
}
