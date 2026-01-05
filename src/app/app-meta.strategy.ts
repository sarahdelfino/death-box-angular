import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AppMetaStrategy {
    constructor(private meta: Meta, private router: Router) {
        this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
            const deepest = this.getDeepest(this.router.routerState.snapshot.root);
            const path = deepest.routeConfig?.path ?? '';

            // Default: remove description to avoid stale/duplicate meta
            this.meta.removeTag(`name="description"`);

            // before setting per-page tags:
            this.meta.removeTag(`name="robots"`);

            // ...
            if (path.startsWith('lobby') || path.startsWith('play')) {
                this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
                return;
            }

            // indexable pages:
            this.meta.updateTag({ name: 'robots', content: 'index, follow' });


            // Indexable pages
            if (path === '') {
                this.meta.updateTag({
                    name: 'description',
                    content:
                        'Deathbox is a free online multiplayer drinking game you can play in your browser. Guess higher or lower, survive the countdown, and mess with your friends in real time.',
                });
                return;
            }

            if (path === 'how-to-play') {
                this.meta.updateTag({
                    name: 'description',
                    content:
                        'Learn how to play Deathbox: rules, jokers, ace-low scoring, and tips for the free online multiplayer drinking game.',
                });
                return;
            }

            // For lobby/:id and play/:id we intentionally keep it blank
            // (prevents duplicates if they ever get crawled)
        });
    }

    private getDeepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
        while (route.firstChild) route = route.firstChild;
        return route;
    }
}
