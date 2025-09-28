import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { GameStore } from '../game.store';
import { MatDialog } from '@angular/material/dialog';
import { HowToPlayComponent } from '../how-to-play/how-to-play.component';
// import { AsyncPipe, NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LobbyComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  readonly store = inject(GameStore);

  // === Store bindings ===
  game$ = this.store.game$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;

  // === Local state ===
  joinGameForm: FormGroup;
  showJoinForm = false;
  showPopup = false;
  isHost = sessionStorage.getItem('host') === 'true';
  infoClicked = false;

  constructor() {
    this.joinGameForm = this.fb.group({
      playerName: ['', Validators.required],
    });

    // 🔹 Watch game stream for "active" status and redirect
    this.game$
      .pipe(
        takeUntilDestroyed(),
        filter((game): game is NonNullable<typeof game> => !!game && game.status === 'active')
      )
      .subscribe(game => {
        this.router.navigateByUrl(`/play/${game.id}`);
      });
  }

  ngOnInit() {
    const gameId = location.pathname.split('/')[2];
    if (gameId) {
      this.store.loadGame(gameId);
    }

    if (!sessionStorage.getItem('player')) {
      this.showJoinForm = true;
      const dialog = document.getElementById('dialog') as HTMLDialogElement;
      dialog?.showModal();
    }
  }

  joinGame() {
    const gameId = location.pathname.split('/')[2];
    const playerName = this.joinGameForm.value.playerName?.trim();

    if (!gameId || !playerName) return;

    this.store.addPlayer({ gameId, playerName });
    sessionStorage.setItem('player', playerName);
    sessionStorage.setItem('host', 'false');
    this.showJoinForm = false;
  }

    toggleInfo(): void {
      this.infoClicked = true;
      this.dialog.open(HowToPlayComponent, {
        width: '400px',
        height: 'fit-content',
        panelClass: 'how-to-play-dialog',
      });
    }

  inviteClicked() {
    const url = window.location.href;
    navigator.clipboard.writeText(`Play deathbox with me! ${url}`);
    this.showPopup = true;
    setTimeout(() => (this.showPopup = false), 1000);
  }

  startGame() {
    const gameId = location.pathname.split('/')[2];
    if (gameId) {
      this.store.startGame(gameId);
    }
  }
}
