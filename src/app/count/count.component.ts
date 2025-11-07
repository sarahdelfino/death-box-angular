import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { GameState } from '../models/game-state.model';
import { GameStore } from '../game.store';
import { of } from 'rxjs';
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

  counters: string[] = [];
  drinker: string | null = null;
  previousSeconds: number | null = null;
  flash = false;

  // --- internal state guards ---
  private authorityRunning = false;
  private tappingRunning = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.counters = Object.keys(this.game.players).filter(
      id => id !== this.game.currentTurn
    );

    this.drinker = this.game.currentTurn;

    // Reset counter at the start of each drinking round
    const prevTurn = changes['game']?.previousValue?.currentTurn;
    const newTurn = changes['game']?.currentValue?.currentTurn;

    if (!this.game.counter || prevTurn !== newTurn) {
      this.game.counter = this.counters.length > 0 ? this.counters[0] : null;
    }

    // Flash animation trigger
    if (this.previousSeconds !== null && this.previousSeconds !== this.game.seconds) {
      this.flash = true;
      setTimeout(() => (this.flash = false), 180);
    }
    this.previousSeconds = this.game.seconds;

    const me = this.sessionPlayer;
    const isDrinker = me === this.drinker;

    // --- Authority logic (drinker side) ---
    if (this.game.counting && isDrinker && !this.authorityRunning) {
      this.countdownAuthority.start(
        this.game.id,
        Object.keys(this.game.players).length - 1,
        this.game.seconds! * 1000,
        this.drinker!
      );
      this.authorityRunning = true;
    }

    if ((!this.game.counting || !isDrinker) && this.authorityRunning) {
      this.countdownAuthority.stop();
      this.authorityRunning = false;
    }

    // --- Tap logic (counter side) ---
    if (this.game.counting && !isDrinker && me && !this.tappingRunning) {
      this.tapService.start(this.game.id, me);
      this.tappingRunning = true;
    }

    if ((!this.game.counting || isDrinker) && this.tappingRunning) {
      this.tapService.stop();
      this.tappingRunning = false;
    }
  }

  ngOnDestroy(): void {
    // Clean up in case component unmounts mid-round
    this.countdownAuthority.stop();
    this.tapService.stop();
    this.authorityRunning = false;
    this.tappingRunning = false;
  }

  get isActive(): boolean {
    const player = sessionStorage.getItem('player');
    return (
      player === this.game.counter &&
      player !== this.drinker &&
      !!this.game?.counting
    );
  }

  get isDrinking(): boolean {
    return sessionStorage.getItem('player') === this.drinker && !!this.game?.counting;
  }

  get liquidHeight(): string {
    if (!this.game?.initialSeconds) return '0%';
    const ratio = this.game.seconds! / this.game.initialSeconds;
    const capped = Math.min(ratio * 100);
    return `${Math.max(0, capped)}%`;
  }

  getSkullPosition(): string {
    if (!this.game?.initialSeconds) return '20%';
    const ratio = this.game.seconds! / this.game.initialSeconds;
    const surface = ratio * 100;
    const offset = surface - 10;
    const clamped = Math.max(offset, 15);
    return `${clamped}%`;
  }

  onTap() {
    if (this.isActive) {
      console.log("TAPPED");
      this.tapService.tap();
    }
  }

  get text(): string {
    return this.game?.seconds === 1 ? 'second' : 'seconds';
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
