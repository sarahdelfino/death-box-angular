import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-how-to-play',
  imports: [CommonModule, MatDialogModule],
  templateUrl: './how-to-play.component.html',
  styleUrl: './how-to-play.component.scss'
})
export class HowToPlayComponent {
  private router = inject(Router);
  shortened = false;

  constructor() {
    console.log(this.router.url);
    if (this.router.url.includes('play')) {
      this.shortened = true;
    }
  }

}
