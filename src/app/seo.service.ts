import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';
import { SeoRouteData } from './app.routes';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly defaultImage =
    'https://deathbox.app/images/deathbox-social-preview.webp';

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  initialize(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        map(() => {
          let route = this.activatedRoute;

          while (route.firstChild) {
            route = route.firstChild;
          }

          return route;
        }),
        mergeMap((route) => route.data)
      )
      .subscribe((data) => {
        const seo = data['seo'] as SeoRouteData | undefined;

        this.updateDescription(seo?.description);
        this.updateRobots(seo?.robots);
        this.updateCanonical(seo?.canonical);
        this.updateSocialTags(seo);
      });
  }

  private updateDescription(description?: string): void {
    if (!description) {
      this.meta.removeTag('name="description"');
      return;
    }

    this.meta.updateTag({
      name: 'description',
      content: description,
    });
  }

  private updateRobots(robots = 'index, follow'): void {
    this.meta.updateTag({
      name: 'robots',
      content: robots,
    });

    this.meta.updateTag({
      name: 'googlebot',
      content: robots,
    });
  }

  private updateCanonical(canonical?: string): void {
    const existing = this.document.head.querySelector(
      'link[rel="canonical"]'
    );

    // Private game URLs should not receive a canonical pointing
    // to a random game ID.
    if (!canonical) {
      existing?.remove();
      return;
    }

    const link =
      existing ??
      this.document.createElement('link');

    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonical);

    if (!existing) {
      this.document.head.appendChild(link);
    }
  }

  private updateSocialTags(seo?: SeoRouteData): void {
    const title = this.document.title;
    const description = seo?.description ?? '';
    const image = seo?.image ?? this.defaultImage;
    const url = seo?.canonical ?? this.document.location.href;

    this.meta.updateTag({
      property: 'og:type',
      content: 'website',
    });

    this.meta.updateTag({
      property: 'og:site_name',
      content: 'Deathbox',
    });

    this.meta.updateTag({
      property: 'og:title',
      content: title,
    });

    this.meta.updateTag({
      property: 'og:description',
      content: description,
    });

    this.meta.updateTag({
      property: 'og:image',
      content: image,
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url,
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: title,
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: description,
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: image,
    });
  }
}