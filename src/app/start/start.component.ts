import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { nanoid } from 'nanoid';
import { GameStore } from '../game.store';
import { MatDialog } from '@angular/material/dialog';
import { getAnalytics, logEvent } from '@angular/fire/analytics';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
  imports: [ReactiveFormsModule]
})
export class StartComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(GameStore);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  @ViewChild('howToPanel') howToPanel!: ElementRef;


  analytics = getAnalytics();

  joinGameForm: FormGroup = this.fb.group({
    id: ['', [Validators.required, Validators.maxLength(5)]],
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    dumb: ['']
  });

  createGameForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
    dumb: ['']
  });

  joinClicked = false;
  createClicked = false;
  isMobile = window.innerWidth < 500;
  showInfo = false;

  ngOnInit() {
    // Listen for ?join=GAMEID param
    this.route.queryParamMap.subscribe(params => {
      const joinId = params.get('join');
      if (joinId) {
        this.joinClicked = true;
        this.createClicked = false;
        // prefill game ID
        this.joinGameForm.patchValue({ id: joinId.toUpperCase() });

        // (optional) auto-focus name input after short delay
        setTimeout(() => {
          const nameInput = document.getElementById('joinName') as HTMLInputElement;
          if (nameInput) nameInput.focus();
        }, 200);
      }
    });
  }

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
        logEvent(this.analytics, 'click_instructions', {
    screen: 'home',
  });
    }
    this.showInfo = !this.showInfo;
    if (this.showInfo) {
      // Wait for DOM to update, then scroll
      setTimeout(() => {
        this.scrollToHowTo();
      }, 50);
    }
  }

  private scrollToHowTo(): void {
    if (!this.howToPanel) return;

    const rect = this.howToPanel.nativeElement.getBoundingClientRect();
    const absoluteY = rect.top + window.scrollY;

    window.scrollTo({
      top: absoluteY - 80, // pull it up a bit
      behavior: 'smooth',
    });
  }


  joinGame(form: FormGroup): void {
    const { name, id, dumb } = form.value;
    if (!name || !id || dumb) { return }
    const img = new Image();
    img.src = `https://robohash.org/${id}${name}?set=set5`;

    sessionStorage.setItem('player', name);
    sessionStorage.setItem('host', 'false');

    logEvent(this.analytics, 'game_joined', {
      game_id: id,
      player: name
    });

    this.store.addPlayer({ gameId: id.toUpperCase(), playerName: name });
    this.router.navigateByUrl(`/lobby/${id.toUpperCase()}`)
  }

  createGame(form: FormGroup): void {
    const { name, dumb } = form.value;
    if (!name || dumb.length) { return }

    const id = nanoid(5).toUpperCase();
    const img = new Image();
    img.src = `https://robohash.org/${id}${name}?set=set5`;

    sessionStorage.setItem('player', name);
    sessionStorage.setItem('host', 'true');

    logEvent(this.analytics, 'game_created', {
      game_id: id,
      player: name
    });

    this.store.createGame({ gameId: id, playerName: name });
    this.router.navigateByUrl(`/lobby/${id}`)
  }
}
