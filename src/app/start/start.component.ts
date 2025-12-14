import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { nanoid } from 'nanoid';
import { GameStore } from '../game.store';
import { MatDialog } from '@angular/material/dialog';
import { getAnalytics, logEvent } from '@angular/fire/analytics';
import { RulesComponent } from '../rules/rules.component';
import { FeedbackComponent } from '../feedback/feedback.component';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  imports: [ReactiveFormsModule, RulesComponent, FeedbackComponent]
})
export class StartComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(GameStore);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  @ViewChild('howToPanel') howToPanel!: ElementRef;

  analytics = getAnalytics();

  private readonly PLAYER_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;    // sanitize names
  private readonly GAME_ID_REGEX = /^[A-Za-z0-9]{3,5}$/;       // allow only A–Z, 0–9
  private readonly ACTION_THROTTLE_MS = 2500;                  // 2.5s per join/create

  joinGameForm: FormGroup = this.fb.group({
    id: [
      '',
      [
        Validators.required,
        Validators.maxLength(5),
        Validators.pattern(this.GAME_ID_REGEX)
      ]
    ],
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        Validators.pattern(this.PLAYER_NAME_REGEX)
      ]
    ],
    dumb: ['']
  });

  createGameForm: FormGroup = this.fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
        Validators.pattern(this.PLAYER_NAME_REGEX)
      ]
    ],
    dumb: ['']
  });

  joinClicked = false;
  createClicked = false;
  isMobile = window.innerWidth < 500;
  showInfo = false;
  showCookieBanner = false;

  private lastActionTs = 0;

  private readonly GA_ID = 'G-CRCM73VNGM';

  ngOnInit() {
    const stored = localStorage.getItem('dbx_analytics_consent');
    if (stored === 'granted') {
      this.enableAnalytics();
    } else if (stored === 'denied') {
      this.showCookieBanner = false;
    } else {
      this.showCookieBanner = true;
    }

    // Handle ?join=XXXX auto-join
    this.route.queryParamMap.subscribe(params => {
      const joinId = params.get('join');
      if (joinId) {
        this.joinClicked = true;
        this.createClicked = false;
        this.joinGameForm.patchValue({ id: joinId.toUpperCase() });

        setTimeout(() => {
          const nameInput = document.getElementById('joinName') as HTMLInputElement;
          if (nameInput) nameInput.focus();
        }, 200);
      }
    });
  }

  // --- Analytics Consent ---
  acceptAnalytics(): void {
    localStorage.setItem('dbx_analytics_consent', 'granted');
    this.enableAnalytics();
    this.showCookieBanner = false;
  }

  rejectAnalytics(): void {
    localStorage.setItem('dbx_analytics_consent', 'denied');

    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      });
    }
    this.showCookieBanner = false;
  }

  private enableAnalytics(): void {
    const w = window as any;
    if (typeof w.gtag !== 'function') return;

    w.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied'
    });

    w.gtag('config', this.GA_ID, {
      anonymize_ip: true
    });
  }

  // --- UI Toggles ---
  toggleJoin(): void {
    if (!this.joinClicked) {
      logEvent(this.analytics, 'click_join_game');
    }
    this.joinClicked = !this.joinClicked;
    if (this.joinClicked) this.createClicked = false;
  }

  toggleCreate(): void {
    if (!this.createClicked) {
      logEvent(this.analytics, 'click_new_game');
    }
    this.createClicked = !this.createClicked;
    if (this.createClicked) this.joinClicked = false;
  }

  toggleInfo(): void {
    if (!this.showInfo) {
      logEvent(this.analytics, 'click_instructions', { screen: 'home' });
    }
    this.showInfo = !this.showInfo;
    if (this.showInfo) {
      setTimeout(() => this.scrollToHowTo(), 50);
    }
  }

  private scrollToHowTo(): void {
    if (!this.howToPanel) return;
    const rect = this.howToPanel.nativeElement.getBoundingClientRect();
    const absoluteY = rect.top + window.scrollY;
    window.scrollTo({ top: absoluteY - 80, behavior: 'smooth' });
  }

  // --- Common Security Helpers ---
  private tooSoon(): boolean {
    const now = Date.now();
    if (now - this.lastActionTs < this.ACTION_THROTTLE_MS) {
      logEvent(this.analytics, 'rate_limited_action', { screen: 'start' });
      return true;
    }
    this.lastActionTs = now;
    return false;
  }

  private sanitize(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }

  // --- Join Game ---
  joinGame(form: FormGroup): void {
    if (this.tooSoon()) return;

    const { name, id, dumb } = form.value;

    if (dumb && dumb.trim().length > 0) {
      logEvent(this.analytics, 'honeypot_triggered_join');
      return;
    }

    if (!form.valid) return;

    const cleanName = this.sanitize(name);
    const cleanId = this.sanitize(id).toUpperCase();

    if (!this.GAME_ID_REGEX.test(cleanId)) return;
    if (!this.PLAYER_NAME_REGEX.test(cleanName)) return;

    const img = new Image();
    img.src = `https://robohash.org/${cleanId}${cleanName}?set=set5`;

    sessionStorage.setItem('player', cleanName);
    sessionStorage.setItem('host', 'false');

    logEvent(this.analytics, 'game_joined', {
      game_id: cleanId,
      player: cleanName,
    });

    this.store.addPlayer({ gameId: cleanId, playerName: cleanName });
    this.router.navigateByUrl(`/lobby/${cleanId}`);
  }

  // --- Create Game ---
  createGame(form: FormGroup): void {
    if (this.tooSoon()) return;

    const { name, dumb } = form.value;
    if (dumb && dumb.trim().length > 0) {
      logEvent(this.analytics, 'honeypot_triggered_create');
      return;
    }

    if (!form.valid) return;

    const cleanName = this.sanitize(name);
    if (!this.PLAYER_NAME_REGEX.test(cleanName)) return;

    const id = nanoid(5).toUpperCase();

    const img = new Image();
    img.src = `https://robohash.org/${id}${cleanName}?set=set5`;

    sessionStorage.setItem('player', cleanName);
    sessionStorage.setItem('host', 'true');

    logEvent(this.analytics, 'game_created', {
      game_id: id,
      player: cleanName,
    });

    this.store.createGame({ gameId: id, playerName: cleanName });
    this.router.navigateByUrl(`/lobby/${id}`);
  }
}