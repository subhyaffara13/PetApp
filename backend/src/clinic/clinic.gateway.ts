import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
      ];
      const envOrigins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      const allowed =
        allowedOrigins.includes(origin) ||
        envOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        process.env.NODE_ENV !== 'production';
      return callback(null, allowed);
    },
    credentials: true,
  },
  namespace: '/clinic-status',
})
export class ClinicGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ClinicGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('Clinic WebSocket Gateway initialized');
  }

  /**
   * Authenticate WebSocket connections on handshake.
   * Clients must send a JWT via `auth.token` in the handshake.
   */
  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`WS connection rejected — no token (${client.id})`);
        client.emit('auth_error', { message: 'Authentication required' });
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      (client as any).user = payload;
      this.logger.log(`Client authenticated: ${client.id} (user=${payload.sub})`);
    } catch (err) {
      this.logger.warn(`WS connection rejected — invalid token (${client.id})`);
      client.emit('auth_error', { message: 'Invalid or expired token' });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  broadcastCapacityUpdate(data: {
    clinicId: string;
    capacityStatus: string;
    clinicName: string;
  }) {
    if (this.server) {
      this.server.emit('capacityUpdate', data);
    }
    this.logger.log(
      `Broadcasted capacity update for ${data.clinicName}: ${data.capacityStatus}`,
    );
  }

  broadcastEmergencyDispatch(data: any) {
    if (this.server) {
      this.server.emit('emergencyDispatch', data);
    }
    this.logger.log(
      `Broadcasted emergency dispatch for pet ${data.petName} to clinic ${data.clinicId}`,
    );
  }

  broadcastMedicalRecordCreated(data: any) {
    if (this.server) {
      this.server.emit('medicalRecordCreated', data);
    }
    this.logger.log(
      `Broadcasted new medical record for pet ${data.petName} (${data.petId})`,
    );
  }
}
