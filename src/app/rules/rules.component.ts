import { Component, OnInit, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss'],
})
export class RulesComponent implements OnInit {
  private meta = inject(Meta);

  ngOnInit(): void {
    this.meta.updateTag({
      name: 'description',
      content:
        'Learn how to play Death Box, a free online multiplayer drinking game. Simple rules, fast rounds, and real-time chaos with friends.',
    });
  }
}
