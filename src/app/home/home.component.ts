import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { nanoid } from 'nanoid';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analyticsservice.service';
import { GameStore } from '../game.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild('gameForms')
  private gameForms?: ElementRef<HTMLElement>;
  private readonly PLAYER_NAME_REGEX = /^[A-Za-z0-9 _-]+$/;
  private readonly GAME_ID_REGEX = /^[A-Za-z0-9]{3,5}$/;
  private readonly ACTION_THROTTLE_MS = 500;
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(GameStore);
  private route = inject(ActivatedRoute);
  private firebaseApp = inject(FirebaseApp);
  private analytics = inject(AnalyticsService);

  @ViewChild('howToPanel') howToPanel!: ElementRef;

  private subs = new Subscription();

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  createClicked = false;
  joinClicked = false;

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

  openCreateForm(): void {
    this.track('open_create_game');
    this.showCreateForm();
    this.scrollToGameForms();
  }

  openJoinForm(): void {
    this.track('open_join_game');
    this.showJoinForm();
    this.scrollToGameForms();
  }

  showCreateForm(): void {
    this.createClicked = true;
    this.joinClicked = false;
  }

  showJoinForm(): void {
    this.createClicked = false;
    this.joinClicked = true;
  }

  closeGameForms(): void {
    this.createClicked = false;
    this.joinClicked = false;
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

  createGame(form: FormGroup): void {
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

  joinGame(form: FormGroup): void {
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

  private scrollToGameForms(): void {
    // Wait for Angular to render the conditional form.
    requestAnimationFrame(() => {
      this.gameForms?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }
}