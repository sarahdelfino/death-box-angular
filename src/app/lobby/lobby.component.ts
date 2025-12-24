import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { GameStore } from '../game.store';
import { MatDialog } from '@angular/material/dialog';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { RulesComponent } from "../rules/rules.component";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RulesComponent],
})
export class LobbyComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  readonly store = inject(GameStore);

  game$ = this.store.game$;
  loading$ = this.store.loading$;
  error$ = this.store.error$;

  analytics = getAnalytics();

  
  private readonly PLAYER_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;
  private readonly GAME_ID_REGEX = /^[A-Za-z0-9]{3,5}$/;
  private readonly ACTION_THROTTLE_MS = 2500;
  private lastActionTs = 0;

  joinGameForm: FormGroup;
  showJoinForm = false;
  showPopup = false;
  isHost = sessionStorage.getItem('host') === 'true';
  infoClicked = false;
  isLoadingAvatars: Record<string, boolean> = {};
  gameId = (location.pathname.split('/')[2] || '').toUpperCase();
  showInviteToast = false;
  inviteToastMessage = '';

  constructor() {
    this.joinGameForm = this.fb.group({
      playerName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
          Validators.pattern(this.PLAYER_NAME_REGEX),
        ],
      ],
      dumb: [''], 
    });

    this.game$
      .pipe(
        takeUntilDestroyed(),
        filter((game): game is NonNullable<typeof game> => !!game && game.status === 'active'),
      )
      .subscribe((game) => {
        this.router.navigateByUrl(`/play/${game.id}`);
      });
  }

  ngOnInit() {
    
    const cleanId = this.sanitize(this.gameId);
    if (!this.GAME_ID_REGEX.test(cleanId)) {
      return; 
    }
    this.gameId = cleanId;

    if (this.gameId) {
      this.store.loadGame(this.gameId);
    }

    if (!sessionStorage.getItem('player')) {
      this.showJoinForm = true;
      const dialogEl = document.getElementById('dialog') as HTMLDialogElement | null;
      dialogEl?.showModal();
    }
  }

  

  private tooSoon(): boolean {
    const now = Date.now();
    if (now - this.lastActionTs < this.ACTION_THROTTLE_MS) {
      logEvent(this.analytics, 'rate_limited_action', {
        screen: 'lobby',
        game_id: this.gameId,
      });
      return true;
    }
    this.lastActionTs = now;
    return false;
  }

  private sanitize(str: string | null | undefined): string {
    return (str ?? '').trim().replace(/\s+/g, ' ');
  }

  private showInviteFeedback(message: string) {
    this.inviteToastMessage = message;
    this.showInviteToast = true;
    setTimeout(() => {
      this.showInviteToast = false;
    }, 1800);
  }

  onImageLoad(playerKey: string) {
    this.isLoadingAvatars[playerKey] = false;
  }

  

  joinGame() {
    if (this.tooSoon()) return;

    const { playerName, dumb } = this.joinGameForm.value as {
      playerName: string;
      dumb?: string;
    };

    
    if (dumb && dumb.trim().length > 0) {
      logEvent(this.analytics, 'honeypot_triggered_join_lobby', {
        game_id: this.gameId,
      });
      return;
    }

    if (!this.gameId || !this.joinGameForm.valid) return;

    const cleanName = this.sanitize(playerName);
    if (!cleanName) return;
    if (!this.PLAYER_NAME_REGEX.test(cleanName)) return;

    const cleanGameId = this.gameId;

    this.store.addPlayer({ gameId: cleanGameId, playerName: cleanName });
    sessionStorage.setItem('player', cleanName);
    sessionStorage.setItem('host', 'false');
    this.showJoinForm = false;
  }

  

  toggleInfo(): void {
    logEvent(this.analytics, 'click_instructions', {
      game_id: this.gameId,
      player: sessionStorage.getItem('player'),
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
    const cleanGameId = this.gameId;

    logEvent(this.analytics, 'click_invite', {
      game_id: cleanGameId,
      player: sessionStorage.getItem('player'),
    });

    const url = window.location.origin + `?join=${cleanGameId}`;
    const shareText = 'Play Death Box with me!';

    const navAny = navigator as any;
    if (navAny.share) {
      navAny
        .share({
          title: `Death Box Lobby - ${cleanGameId}`,
          text: shareText,
          url,
        })
        .catch((err: unknown) => {
          console.warn('Share dismissed or failed', err);
        });
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(`${shareText} ${url}`)
        .then(() => {
          this.showInviteFeedback('Link copied! Paste it to your friends.');
        })
        .catch((err) => {
          console.error('Clipboard error', err);
          this.showInviteFeedback(
            'Copy failed. Try long-press or right-click to copy the address bar.',
          );
        });
    } else {
      this.showInviteFeedback('Copy the link from the address bar and share it.');
    }
  }

  

  startGame() {
    const cleanGameId = this.gameId;

    logEvent(this.analytics, 'click_start', {
      game_id: cleanGameId,
      screen: 'lobby',
    });

    if (cleanGameId) {
      this.store.startGame(cleanGameId);
    }
  }
}
