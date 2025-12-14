import { Injectable, inject } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class TapService {
  private rtdb = inject(Database);
  private tapCount = 0;
  private flushTimer: any = null;

  start(gameId: string, playerId: string) {
    this.flushTimer = setInterval(() => {
      if (this.tapCount > 0) {
        const now = Date.now();
        const bucket = Math.floor(now / 250); 
        set(
          ref(this.rtdb, `games/${gameId}/tapBuffer/${playerId}/${bucket}`),
          true
        );
        this.tapCount = 0;
      }
    }, 400); 
  }

  tap() {
    this.tapCount++;
  }

  stop() {
    clearInterval(this.flushTimer);
    this.tapCount = 0;
  }
}
