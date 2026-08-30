import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminUser, AdminUserSchema, AdminClaim, AdminClaimSchema, AdminLog, AdminLogSchema } from './admin.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Order, OrderSchema } from '../schemas/order.schema';
import { CommunityReport, CommunityReportSchema } from '../schemas/community.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: AdminClaim.name, schema: AdminClaimSchema },
      { name: AdminLog.name, schema: AdminLogSchema },
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
      { name: CommunityReport.name, schema: CommunityReportSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminAuthGuard],
  exports: [AdminService],
})
export class AdminModule {}
