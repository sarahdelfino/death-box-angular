import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const deepest = this.getDeepest(snapshot.root);

    const routeTitle =
      deepest.title ||
      deepest.data?.['title'] ||
      this.buildTitle(snapshot) ||
      '';

    const id = deepest.params?.['id'];
    const path = deepest.routeConfig?.path || '';

    let final = 'Death Box';

    if (path.startsWith('lobby') && id) {
      final = `Lobby ${id}`;
    } else if (path.startsWith('play') && id) {
      final = `Game ${id}`;
    } else if (routeTitle) {
      final = `Death Box – ${routeTitle}`;
    }

    this.title.setTitle(final);
  }

  private getDeepest(route: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    while (route.firstChild) route = route.firstChild;
    return route;
  }
}
