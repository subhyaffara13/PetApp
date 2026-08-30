import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmergencyModule } from './emergency/emergency.module';
import { ChatModule } from './chat/chat.module';
import { PetProfileModule } from './pet-profile/pet-profile.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ClinicModule } from './clinic/clinic.module';
import { PimsModule } from './pims/pims.module';
import { CommunityModule } from './community/community.module';
import { DeliveryManagementModule } from './delivery-management/delivery-management.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { SheltersModule } from './shelters/shelters.module';

let memoryDbUri: string | undefined = undefined;
const logger = new Logger('MongoConnection');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        let uri = configService.get<string>('MONGO_DB_CONNECTION_STRING');
        const isProd = process.env.NODE_ENV === 'production';

        // Avoid silently launching an in-memory database in production.
        // If we are not pointed at a real Mongo (USE_ATLAS !== 'true'), fail fast so a
        // misconfigured deploy cannot run with ephemeral (data-losing) storage.
        if (process.env.USE_ATLAS !== 'true') {
          if (isProd) {
            throw new Error(
              'Refusing to start in production without a real MongoDB. Set USE_ATLAS=true and MONGO_DB_CONNECTION_STRING.',
            );
          }
          if (!memoryDbUri) {
            try {
              const { MongoMemoryServer } = require('mongodb-memory-server');
              const mongod = await MongoMemoryServer.create();
              memoryDbUri = mongod.getUri();
              logger.log(`[MongoMemoryServer] Embedded database running at: ${memoryDbUri}`);
            } catch (err) {
              logger.warn('MongoMemoryServer fallback to localhost', err);
              memoryDbUri = 'mongodb://127.0.0.1:27017/petsos';
            }
          }
          uri = memoryDbUri;
        }

        return {
          uri,
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          retryWrites: true,
          w: 'majority',
        };
      },
      inject: [ConfigService],
    }),
    EmergencyModule,
    ChatModule,
    PetProfileModule,
    MarketplaceModule,
    ClinicModule,
    PimsModule,
    CommunityModule,
    DeliveryManagementModule,
    AdminModule,
    AuthModule,
    UploadModule,
    SheltersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}