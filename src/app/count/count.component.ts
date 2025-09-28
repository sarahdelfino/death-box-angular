import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { GameState } from '../models/game-state.model';
import { GameStore } from '../game.store';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class CountComponent implements OnChanges {

  private store = inject(GameStore);

  @Input() game!: GameState;
  @Input() sessionPlayer!: string | null;

  @Output() nextCounter = new EventEmitter<string>();

  counters: string[] = [];
  drinker: string | null = null;

ngOnChanges(changes: SimpleChanges): void {
  this.counters = Object.keys(this.game.players).filter(
    id => id !== this.game.currentTurn
  );

  console.log('Counters:', this.counters);

  this.drinker = this.game.currentTurn;
  // Reset counter at the start of each drinking round
  const prevTurn = changes['game']?.previousValue?.currentTurn;
  const newTurn = changes['game']?.currentValue?.currentTurn;

  if (!this.game.counter || prevTurn !== newTurn) {
    this.game.counter = this.counters[0];
  }
}

  get isActive(): boolean {
    return sessionStorage.getItem("player") === this.game.counter && !!this.game?.counting;
  }

  get isDrinking(): boolean {
    return sessionStorage.getItem("player") === this.drinker && !!this.game?.counting;
  }

  get liquidHeight(): string {
      if (!this.game?.initialSeconds) return '0%';
  const ratio = this.game.seconds! / this.game.initialSeconds;
  return `${Math.max(0, ratio * 100)}%`;
  }

  get text(): string {
    return this.game?.seconds === 1 ? 'second' : 'seconds';
  }

count() {
  if (this.game.seconds! > 1) {
    this.store.decrementSeconds(of(this.game.id));

    // Only rotate counters if there are multiple
    if (this.counters.length > 1) {
      this.nextCounter.emit(this.getNextCounter());
    }
  } else {
    this.store.endCounting(this.game.id);
  }
}

getNextCounter(): string {
  if (this.counters.length === 1) {
    return this.counters[0];
  }

  const currentIndex = this.counters.indexOf(this.game.counter!);
  const nextIndex = (currentIndex + 1) % this.counters.length;
  return this.counters[nextIndex];
}

}
