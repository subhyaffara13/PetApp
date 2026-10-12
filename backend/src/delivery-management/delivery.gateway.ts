import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
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
})
export class DeliveryGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DeliveryGateway.name);

  constructor(private readonly jwtService: JwtService) {}

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
      this.logger.log(`WS client authenticated: ${client.id} (user=${payload.sub})`);
    } catch (err) {
      this.logger.warn(`WS connection rejected — invalid token (${client.id})`);
      client.emit('auth_error', { message: 'Invalid or expired token' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('join:store')
  handleJoinStore(
    @ConnectedSocket() client: Socket,
    @MessageBody() storeId: string,
  ) {
    client.join(`store:${storeId}`);
  }

  @SubscribeMessage('join:order')
  handleJoinOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() masterOrderId: string,
  ) {
    client.join(`order:${masterOrderId}`);
  }

  public notifyStoreNewOrder(storeId: string, payload: any): void {
    this.server?.to(`store:${storeId}`).emit('NEW_ORDER_ALERT', payload);
  }

  public emitSubOrderStatusUpdate(
    storeId: string,
    masterOrderId: string,
    subOrderId: string,
    status: string,
    extra: Record<string, any> = {},
  ): void {
    // Notify Store Dashboard
    this.server?.to(`store:${storeId}`).emit('ORDER_STATUS_CHANGED', {
      masterOrderId,
      subOrderId,
      status,
      ...extra,
    });

    // Notify Customer Order Tracker
    this.server?.to(`order:${masterOrderId}`).emit('ORDER_PROGRESS', {
      subOrderId,
      status,
      ...extra,
    });
  }

  public emitCourierLocationPing(
    masterOrderId: string,
    subOrderId: string,
    coordinates: [number, number],
  ): void {
    this.server?.to(`order:${masterOrderId}`).emit('COURIER_LOCATION', {
      subOrderId,
      coordinates,
      timestamp: Date.now(),
    });
  }
}
