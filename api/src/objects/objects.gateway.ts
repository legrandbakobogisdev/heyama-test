import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ObjectEntity } from './schemas/object.schema';

@WebSocketGateway({ cors: { origin: '*' } })
export class ObjectsGateway {
  @WebSocketServer()
  server: Server;

  emitCreated(obj: ObjectEntity) {
    this.server.emit('object:created', obj);
  }

  emitDeleted(id: string) {
    this.server.emit('object:deleted', id);
  }
}
