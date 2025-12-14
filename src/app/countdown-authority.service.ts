import { Injectable } from '@angular/core';
import {
  onValue,
  ref,
  update,
  get,
  child,
  getDatabase,
} from '@angular/fire/database';

interface TapRow {
  bucketCount?: number;
  lastTap?: number | string;
}

@Injectable({ providedIn: 'root' })
export class CountdownAuthorityService {
  private rtdb = getDatabase();
  private tapsUnsub?: () => void;
  private rafId?: number;

  private currentSpeed = 1.0;
  private readonly BASE = 1.0;         
  private readonly GAIN = 1.2;         
  private readonly GLOBAL_CAP = 3.5;   
  private readonly TAP_WINDOW_MS = 800;
  private readonly BUCKET_MS = 250;    

  start(
    gameId: string,
    totalCounters: number,
    initialMs: number,
    drinkerId: string
  ): void {
    
    this.incrementStat(gameId, drinkerId, 'assigned', Math.round(initialMs / 1000));

    let initialized = false; 
    let startTime = performance.now(); 

    
    const tapsRef = ref(this.rtdb, `games/${gameId}/tapBuffer`);
    this.tapsUnsub = onValue(tapsRef, (snapshot) => {
      const now = Date.now();
      const currentBucket = Math.floor(now / this.BUCKET_MS);
      const recentCutoff = currentBucket - Math.ceil(this.TAP_WINDOW_MS / this.BUCKET_MS);
      const rows: TapRow[] = [];

      snapshot.forEach((playerSnap) => {
        let bucketCount = 0;
        let latestBucketTs = 0;

        playerSnap.forEach((bucketSnap) => {
          const bucketKey = parseInt(bucketSnap.key || '0', 10);
          if (bucketKey >= recentCutoff) {
            bucketCount++;
            latestBucketTs = Math.max(latestBucketTs, bucketKey * this.BUCKET_MS);
          }
        });

        if (bucketCount > 0) {
          rows.push({ bucketCount, lastTap: latestBucketTs });
        }
      });

      const active = rows.filter((r) => {
        if (!r.lastTap) return false;
        const lastTapMs =
          typeof r.lastTap === 'number' ? r.lastTap : Date.parse(r.lastTap);
        return now - lastTapMs <= this.TAP_WINDOW_MS;
      });

      const participation = active.length / Math.max(1, totalCounters);
      let tapIntensity =
        active.reduce((sum, r) => sum + (r.bucketCount ?? 0), 0) /
        Math.max(1, active.length);
      tapIntensity = Math.min(tapIntensity, 8);

      const effectiveIntensity = Math.pow(tapIntensity * participation, 0.7);
      const targetSpeed = Math.min(
        this.GLOBAL_CAP,
        this.BASE + effectiveIntensity * this.GAIN
      );

      
      if (!initialized && active.length === 0) {
        this.currentSpeed = 1.0;
      } else {
        this.currentSpeed = this.currentSpeed * 0.7 + targetSpeed * 0.3;
        initialized = true;
      }
    });

    
    const gameRef = ref(this.rtdb, `games/${gameId}`);
    let lastFrame = startTime;
    let elapsedSinceLastPublish = 0;
    let visibleSeconds = Math.round(initialMs / 1000);

    const tick = (time: number) => {
      const dtMs = Math.min(time - lastFrame, 100);
      lastFrame = time;
      elapsedSinceLastPublish += dtMs * this.currentSpeed;

      if (elapsedSinceLastPublish >= 1000) {
        const steps = Math.floor(elapsedSinceLastPublish / 1000);
        elapsedSinceLastPublish -= steps * 1000;
        visibleSeconds -= steps;

        if (visibleSeconds > 0) {
          update(gameRef, { seconds: visibleSeconds });
        } else {
          this.currentSpeed = 1.0;
          update(gameRef, { counting: false, seconds: 0 });
          cancelAnimationFrame(this.rafId!);

          const endTime = performance.now();
          const actualMs = endTime - startTime;
          const actualSeconds = Math.round(actualMs / 1000);

          setTimeout(() => {
            this.incrementStat(gameId, drinkerId, 'actual', actualSeconds);
          }, 100);

          return;
        }
      }

      this.rafId = requestAnimationFrame(tick);
    };

    
    lastFrame = startTime;
    this.rafId = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.tapsUnsub) {
      this.tapsUnsub();
      this.tapsUnsub = undefined;
    }
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  /** Increment running totals for stats */
  private async incrementStat(
    gameId: string,
    playerId: string,
    key: 'assigned' | 'actual',
    amount: number
  ): Promise<void> {
    try {
      const snapshot = await get(
        child(ref(this.rtdb), `games/${gameId}/stats/${playerId}/${key}`)
      );
      const prev = snapshot.exists() ? snapshot.val() : 0;
      const next = prev + amount;
      await update(ref(this.rtdb, `games/${gameId}/stats/${playerId}`), { [key]: next });
    } catch (e) {
      console.error('incrementStat failed', e);
    }
  }
}
