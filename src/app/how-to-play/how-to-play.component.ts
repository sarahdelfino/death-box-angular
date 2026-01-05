import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RulesComponent } from "../rules/rules.component";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-how-to-play',
  imports: [CommonModule, RouterLink, RulesComponent],
  templateUrl: './how-to-play.component.html',
  styleUrl: './how-to-play.component.scss',
})
export class HowToPlayComponent implements OnInit {
private meta = inject(Meta);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // Route-level meta (better than putting this in RulesComponent)
    this.meta.updateTag({
      name: 'description',
      content:
        'Learn how to play Death Box, a free online multiplayer drinking game. Simple rules, fast rounds, and real-time chaos with friends.',
    });

    // Optional canonical (helps avoid weird query-param duplicates)
    if (isPlatformBrowser(this.platformId)) {
      const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      const canonicalUrl = `${location.origin}/how-to-play`;

      if (link) link.href = canonicalUrl;
      else {
        const el = document.createElement('link');
        el.rel = 'canonical';
        el.href = canonicalUrl;
        document.head.appendChild(el);
      }
    }
  }
}
