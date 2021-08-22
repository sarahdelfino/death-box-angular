import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Observer } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export const environment = {
  production: false,
  SOCKET_ENDPOINT: 'http://localhost:3000'
};

export class SocketService {
  socket;

  constructor(private io: Socket) { }

  setupSocketConnection() {
    this.socket = this.io(environment.SOCKET_ENDPOINT)
  }

  
}
