import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { nanoid } from 'nanoid';
import { GameStore } from '../game.store';
import { MatDialog } from '@angular/material/dialog';
import { RulesComponent } from '../rules/rules.component';
import { FeedbackComponent } from '../feedback/feedback.component';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { FirebaseApp } from '@angular/fire/app';
import { AnalyticsService } from '../analyticsservice.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  imports: [ReactiveFormsModule, RulesComponent, FeedbackComponent],
})
export class StartComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(GameStore);
  private route = inject(ActivatedRoute);
  private firebaseApp = inject(FirebaseApp);
  private analytics = inject(AnalyticsService);

  @ViewChild('howToPanel') howToPanel!: ElementRef;

  private platformId = inject(PLATFORM_ID);

  private readonly PLAYER_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;
  private readonly GAME_ID_REGEX = /^[A-Za-z0-9]{3,5}$/;
  private readonly ACTION_THROTTLE_MS = 2500;

  private subs = new Subscription();

  joinGameForm: FormGroup = this.fb.group({
    id: ['', [Validators.required, Validators.maxLength(5), Validators.pattern(this.GAME_ID_REGEX)]],
    name: [
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

  createGameForm: FormGroup = this.fb.group({
    name: [
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

  joinClicked = false;
  createClicked = false;
  showInfo = false;

  private lastActionTs = 0;

  private track(name: string, params?: Record<string, any>) {
    this.analytics.track(name, params);
  }

  async ngOnInit() {
    // Normalize inputs
    this.subs.add(
      this.joinGameForm.get('name')!.valueChanges.subscribe((v) => {
        const next = this.sanitizeNameInput(v);
        if (next !== v) this.joinGameForm.get('name')!.setValue(next, { emitEvent: false });
      })
    );

    this.subs.add(
      this.joinGameForm.get('id')!.valueChanges.subscribe((v) => {
        const next = this.sanitizeGameIdInput(v);
        if (next !== v) this.joinGameForm.get('id')!.setValue(next, { emitEvent: false });
      })
    );

    this.subs.add(
      this.createGameForm.get('name')!.valueChanges.subscribe((v) => {
        const next = this.sanitizeNameInput(v);
        if (next !== v) this.createGameForm.get('name')!.setValue(next, { emitEvent: false });
      })
    );

    // Join param
    this.subs.add(
      this.route.queryParamMap.subscribe((params) => {
        const joinId = params.get('join');
        if (joinId) {
          this.joinClicked = true;
          this.createClicked = false;

          const cleaned = this.sanitizeGameIdInput(joinId);
          this.joinGameForm.patchValue({ id: cleaned });

          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
              const nameInput = document.getElementById('joinName') as HTMLInputElement;
              if (nameInput) nameInput.focus();
            }, 200);
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggleJoin(): void {
    if (!this.joinClicked) this.track('click_join_game');
    this.joinClicked = !this.joinClicked;
    if (this.joinClicked) this.createClicked = false;
  }

  toggleCreate(): void {
    if (!this.createClicked) this.track('click_new_game');
    this.createClicked = !this.createClicked;
    if (this.createClicked) this.joinClicked = false;
  }

  toggleInfo(): void {
    if (!this.showInfo) this.track('click_instructions', { screen: 'home' });
    this.showInfo = !this.showInfo;
    if (this.showInfo) setTimeout(() => this.scrollToHowTo(), 50);
  }

  private scrollToHowTo(): void {
    if (!this.howToPanel) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const rect = this.howToPanel.nativeElement.getBoundingClientRect();
    const absoluteY = rect.top + window.scrollY;
    window.scrollTo({ top: absoluteY - 80, behavior: 'smooth' });
  }

  private tooSoon(): boolean {
    const now = Date.now();
    if (now - this.lastActionTs < this.ACTION_THROTTLE_MS) {
      this.track('rate_limited_action', { screen: 'start' });
      return true;
    }
    this.lastActionTs = now;
    return false;
  }

  private sanitize(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  private sanitizeNameInput(v: unknown): string {
    return this.sanitize(String(v ?? ''));
  }

  private sanitizeGameIdInput(v: unknown): string {
    return this.sanitize(String(v ?? ''))
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 5);
  }

  joinGame(form: FormGroup): void {
    if (this.tooSoon()) return;

    const raw = form.getRawValue() as { name: string; id: string; dumb: string };

    if (raw.dumb && raw.dumb.trim().length > 0) {
      this.track('honeypot_triggered_join');
      return;
    }

    const cleanName = this.sanitizeNameInput(raw.name);
    const cleanId = this.sanitizeGameIdInput(raw.id);

    this.joinGameForm.patchValue({ name: cleanName, id: cleanId }, { emitEvent: false });

    if (!this.joinGameForm.valid) return;
    if (!this.GAME_ID_REGEX.test(cleanId)) return;
    if (!this.PLAYER_NAME_REGEX.test(cleanName)) return;

    if (isPlatformBrowser(this.platformId)) {
      const img = new Image();
      img.src = `https://robohash.org/${cleanId}${cleanName}?set=set5`;
    }

    sessionStorage.setItem('player', cleanName);
    sessionStorage.setItem('host', 'false');

    this.track('game_joined', { game_id: cleanId });

    this.store.addPlayer({ gameId: cleanId, playerName: cleanName });
    this.router.navigateByUrl(`/lobby/${cleanId}`);
  }

  createGame(form: FormGroup): void {
    if (this.tooSoon()) return;

    const raw = form.getRawValue() as { name: string; dumb: string };

    if (raw.dumb && raw.dumb.trim().length > 0) {
      this.track('honeypot_triggered_create');
      return;
    }

    const cleanName = this.sanitizeNameInput(raw.name);
    this.createGameForm.patchValue({ name: cleanName }, { emitEvent: false });

    if (!this.createGameForm.valid) return;
    if (!this.PLAYER_NAME_REGEX.test(cleanName)) return;

    const id = nanoid(5).toUpperCase();

    if (isPlatformBrowser(this.platformId)) {
      const img = new Image();
      img.src = `https://robohash.org/${id}${cleanName}?set=set5`;
    }

    sessionStorage.setItem('player', cleanName);
    sessionStorage.setItem('host', 'true');

    this.track('game_created', { game_id: id });

    this.store.createGame({ gameId: id, playerName: cleanName });
    this.router.navigateByUrl(`/lobby/${id}`);
  }
}
