import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../models/game-state.model';

@Component({
  selector: 'app-scoreboard',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent {
  @Input() game!: GameState;
  get playerIds(): string[] {
    return Object.keys(this.game.players || {});
  }

  diff(p: string): number {
    const s = this.game.stats?.[p];
    if (!s?.assigned || !s?.actual) return 0;
    return s.actual - s.assigned;
  }
}
