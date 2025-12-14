import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { GameStore } from '../game.store';
import { MatDialog } from '@angular/material/dialog';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { HowToPlayComponent } from "../how-to-play/how-to-play.component";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
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
  infoClicked = true;
  isLoadingAvatars: Record<string, boolean> = {};
  analytics = getAnalytics();
  gameId = location.pathname.split('/')[2];
  showInviteToast = false;
inviteToastMessage = '';


  constructor() {
    this.joinGameForm = this.fb.group({
      playerName: ['', Validators.required],
    });

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
    if (this.gameId) {
      this.store.loadGame(this.gameId);
    }

    if (!sessionStorage.getItem('player')) {
      this.showJoinForm = true;
      const dialog = document.getElementById('dialog') as HTMLDialogElement;
      dialog?.showModal();
    }
  }

  private showInviteFeedback(message: string) {
  this.inviteToastMessage = message;
  this.showInviteToast = true;

  // clear any existing timer if you store it, but simple is fine for now
  setTimeout(() => {
    this.showInviteToast = false;
  }, 1800);
}

  onImageLoad(playerKey: string) {
    this.isLoadingAvatars[playerKey] = false;
  }

  joinGame() {
    const playerName = this.joinGameForm.value.playerName?.trim();

    if (!this.gameId || !playerName) return;

    this.store.addPlayer({ gameId: this.gameId, playerName });
    sessionStorage.setItem('player', playerName);
    sessionStorage.setItem('host', 'false');
    this.showJoinForm = false;
  }

  toggleInfo(): void {
    logEvent(this.analytics, 'click_instructions', {
      game_id: this.gameId,
      player: sessionStorage.getItem('player')
    });
    this.infoClicked = !this.infoClicked;
      if (this.infoClicked) {
    setTimeout(() => {
      document
        .getElementById('how-to-panel')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }
  }

inviteClicked() {
  logEvent(this.analytics, 'click_invite', {
    game_id: this.gameId,
    player: sessionStorage.getItem('player')
  });

  const url = window.location.origin + `?join=${this.gameId}`;
  const shareText = 'Play Deathbox with me!';

  // 1) Prefer native share on mobile
  const navAny = navigator as any;
  if (navAny.share) {
    navAny
      .share({
        title: `Deathbox Lobby - ${this.gameId}`,
        text: shareText,
        url
      })
      .catch((err: unknown) => {
        // user cancelled or share failed – silently ignore
        console.warn('Share dismissed or failed', err);
      });
    return;
  }

  // 2) Fallback: copy to clipboard
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(`${shareText} ${url}`)
      .then(() => {
        this.showInviteFeedback('Link copied! Paste it to your friends.');
      })
      .catch(err => {
        console.error('Clipboard error', err);
        this.showInviteFeedback('Copy failed. Try long-press or right-click to copy the address bar.');
      });
  } else {
    // 3) Last-resort fallback: prompt
    this.showInviteFeedback('Copy the link from the address bar and share it.');
  }
}


  startGame() {
    logEvent(this.analytics, 'click_start', {
      game_id: this.gameId,
      screen: 'lobby',
    });
    if (this.gameId) {
      this.store.startGame(this.gameId);
    }
  }
}
