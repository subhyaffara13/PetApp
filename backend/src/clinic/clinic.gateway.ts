import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/clinic-status',
})
export class ClinicGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ClinicGateway.name);

  afterInit() {
    this.logger.log('Clinic WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
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
