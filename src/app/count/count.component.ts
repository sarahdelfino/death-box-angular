import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { GameState } from '../models/game-state.model';
import { GameStore } from '../game.store';
import { CommonModule } from '@angular/common';
import { TapService } from '../tap.service';
import { CountdownAuthorityService } from '../countdown-authority.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CountComponent implements OnChanges, OnDestroy {
  private store = inject(GameStore);
  private tapService = inject(TapService);
  private countdownAuthority = inject(CountdownAuthorityService);

  @Input() game!: GameState;
  @Input() sessionPlayer!: string | null;

  @Output() nextCounter = new EventEmitter<string>();
  @Output() finished = new EventEmitter<void>();

  counters: string[] = [];
  drinker: string | null = null;

  previousSeconds: number | null = null;
  flash = false;

  stage: 'prep' | 'counting' = 'prep';
  assignedSeconds: number | null = null;

  
  private authorityRunning = false;
  private tappingRunning = false;

  private prepTimerId: number | null = null;
  private readonly PREP_DURATION_MS = 1200;

  
  prepProgress = 0; 
  private prepStartAt: number | null = null;
  private prepRafId: number | null = null;

  
  private countRafId: number | null = null;
  private lastSecondValue: number | null = null;       
  private lastSecondChangedAt: number | null = null;   
  private smoothSeconds: number | null = null;         

  
  private uiSeconds: number | null = null;
  private pendingCloseTimer: number | null = null;

  get displaySeconds(): number | null {
    if (this.stage === 'counting') return this.uiSeconds ?? this.game?.seconds ?? null;
    return this.assignedSeconds;
  }

  /** 0..1 used by CSS fill bar (prep fills up, counting drains smoothly) */
  get fillScale(): string {
    const initial = this.game?.initialSeconds ?? this.assignedSeconds ?? 0;
    if (!initial) return '0';

    
    if (this.stage === 'prep') {
      return String(this.clamp01(this.prepProgress));
    }

    
    const remaining = this.smoothSeconds ?? (this.game?.seconds ?? 0);
    return String(this.clamp01(remaining / initial));
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    this.counters = Object.keys(this.game.players).filter(
      (id) => id !== this.game.currentTurn
    );
    this.drinker = this.game.currentTurn;

    const prevGame = changes['game']?.previousValue as GameState | undefined;
    const currGame = changes['game']?.currentValue as GameState;

    const prevTurn = prevGame?.currentTurn;
    const newTurn = currGame?.currentTurn;

    if (!this.game.counter || prevTurn !== newTurn) {
      this.game.counter = this.counters.length > 0 ? this.counters[0] : null;
    }

    
    if (this.stage === 'counting' && currGame?.seconds != null) {
      const s = currGame.seconds;
      if (this.lastSecondValue === null || s !== this.lastSecondValue) {
        this.lastSecondValue = s;
        this.lastSecondChangedAt = performance.now();
        this.smoothSeconds = s;
      }

      
      if (this.uiSeconds === null || this.uiSeconds !== 0) {
        this.uiSeconds = Math.max(0, s);
      }
    }

    
    if (this.previousSeconds !== null && this.previousSeconds !== this.game.seconds) {
      this.flash = true;
      setTimeout(() => (this.flash = false), 180);
    }
    this.previousSeconds = this.game.seconds;

    
    const startedCountingNow =
      !!currGame?.counting && (!prevGame || !prevGame.counting);
    const newDrinker = prevTurn !== newTurn;

    if (startedCountingNow || newDrinker) {
      this.startPrepForNewRound();
    }

    const stoppedCountingNow = !!prevGame?.counting && !currGame?.counting;

    
    if (stoppedCountingNow) {
      
      this.uiSeconds = 0;

      
      if (this.pendingCloseTimer !== null) {
        clearTimeout(this.pendingCloseTimer);
        this.pendingCloseTimer = null;
      }

      
      this.pendingCloseTimer = window.setTimeout(() => {
        this.pendingCloseTimer = null;
        this.finished.emit();
        this.teardownRound();
      }, 200);
      return;
    }

    this.syncAuthorityAndTaps();
  }

  ngOnDestroy(): void {
    this.teardownRound();
  }

  private startPrepForNewRound(): void {
    this.clearPrepTimer();
    this.stopPrepAnimation();
    this.stopCountAnimation();

    if (this.pendingCloseTimer !== null) {
      clearTimeout(this.pendingCloseTimer);
      this.pendingCloseTimer = null;
    }

    
    this.assignedSeconds = this.game.initialSeconds ?? this.game.seconds ?? null;

    
    this.stage = 'prep';
    this.prepProgress = 0;
    this.prepStartAt = performance.now();
    this.startPrepAnimation();

    
    this.countdownAuthority.stop();
    this.tapService.stop();
    this.authorityRunning = false;
    this.tappingRunning = false;

    
    this.lastSecondValue = null;
    this.lastSecondChangedAt = null;
    this.smoothSeconds = null;

    
    this.uiSeconds = null;

    this.prepTimerId = window.setTimeout(() => {
      if (!this.game?.counting) return;

      
      this.prepProgress = 1;
      this.stopPrepAnimation();

      
      this.stage = 'counting';

      
      const s = this.game?.seconds ?? this.assignedSeconds ?? 0;
      this.lastSecondValue = s;
      this.lastSecondChangedAt = performance.now();
      this.smoothSeconds = s;

      this.uiSeconds = Math.max(0, s);

      this.startCountAnimation();
      this.syncAuthorityAndTaps();
    }, this.PREP_DURATION_MS);
  }

  private startPrepAnimation(): void {
    const tick = () => {
      if (this.stage !== 'prep' || this.prepStartAt === null) return;

      const elapsed = performance.now() - this.prepStartAt;
      this.prepProgress = this.clamp01(elapsed / this.PREP_DURATION_MS);

      if (this.prepProgress < 1) {
        this.prepRafId = requestAnimationFrame(tick);
      } else {
        this.prepRafId = null;
      }
    };

    this.prepRafId = requestAnimationFrame(tick);
  }

  private stopPrepAnimation(): void {
    if (this.prepRafId !== null) {
      cancelAnimationFrame(this.prepRafId);
      this.prepRafId = null;
    }
    this.prepStartAt = null;
  }

  
  private startCountAnimation(): void {
    const tick = () => {
      if (this.stage !== 'counting' || !this.game?.counting) return;

      const initial = this.game?.initialSeconds ?? this.assignedSeconds ?? 0;
      const base = this.lastSecondValue ?? (this.game?.seconds ?? 0);
      const t0 = this.lastSecondChangedAt ?? performance.now();

      
      const elapsedMs = performance.now() - t0;
      const frac = this.clamp01(elapsedMs / 1000);

      const real = this.game?.seconds ?? base;
      const interpolated = base - frac;

      
      this.smoothSeconds = Math.max(real, Math.max(0, interpolated));

      if (initial) this.smoothSeconds = Math.min(this.smoothSeconds, initial);

      
      
      if (this.uiSeconds !== 0) {
        this.uiSeconds = Math.max(0, Math.ceil(this.smoothSeconds ?? 0));
      }

      this.countRafId = requestAnimationFrame(tick);
    };

    this.countRafId = requestAnimationFrame(tick);
  }

  private stopCountAnimation(): void {
    if (this.countRafId !== null) {
      cancelAnimationFrame(this.countRafId);
      this.countRafId = null;
    }
    this.lastSecondValue = null;
    this.lastSecondChangedAt = null;
    this.smoothSeconds = null;
  }

  private teardownRound(): void {
    this.clearPrepTimer();

    if (this.pendingCloseTimer !== null) {
      clearTimeout(this.pendingCloseTimer);
      this.pendingCloseTimer = null;
    }

    this.stopPrepAnimation();
    this.stopCountAnimation();

    this.countdownAuthority.stop();
    this.tapService.stop();
    this.authorityRunning = false;
    this.tappingRunning = false;

    this.stage = 'prep';
    this.assignedSeconds = null;
    this.prepProgress = 0;

    this.uiSeconds = null;
  }

  private clearPrepTimer(): void {
    if (this.prepTimerId !== null) {
      clearTimeout(this.prepTimerId);
      this.prepTimerId = null;
    }
  }

  private syncAuthorityAndTaps(): void {
    const me = this.sessionPlayer;
    const isDrinker = me === this.drinker;
    const canRun = !!this.game?.counting && this.stage === 'counting';

    
    if (canRun && isDrinker && !this.authorityRunning) {
      const ms = (this.game.initialSeconds ?? this.game.seconds ?? 0) * 1000;

      this.countdownAuthority.start(
        this.game.id,
        Object.keys(this.game.players).length - 1,
        ms,
        this.drinker!
      );
      this.authorityRunning = true;
    } else if ((!canRun || !isDrinker) && this.authorityRunning) {
      this.countdownAuthority.stop();
      this.authorityRunning = false;
    }

    
    if (canRun && !isDrinker && me && !this.tappingRunning) {
      this.tapService.start(this.game.id, me);
      this.tappingRunning = true;
    } else if ((!canRun || isDrinker) && this.tappingRunning) {
      this.tapService.stop();
      this.tappingRunning = false;
    }
  }

  get isActive(): boolean {
    const player = sessionStorage.getItem('player');
    return (
      this.stage === 'counting' &&
      player === this.game.counter &&
      player !== this.drinker &&
      !!this.game?.counting
    );
  }

  
  get isDrinking(): boolean {
    return sessionStorage.getItem('player') === this.drinker && !!this.game?.counting;
  }

  onTap(): void {
    if (this.isActive) this.tapService.tap();
  }

  private clamp01(n: number): number {
    return Math.max(0, Math.min(1, n));
  }

  getNextCounter(): string | null {
    if (!this.counters.length) return null;
    const currentIndex = this.counters.indexOf(this.game.counter!);
    let nextIndex = (currentIndex + 1) % this.counters.length;
    if (this.counters[nextIndex] === this.drinker) {
      nextIndex = (nextIndex + 1) % this.counters.length;
    }
    return this.counters[nextIndex];
  }
}
