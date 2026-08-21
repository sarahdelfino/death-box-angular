import { Routes } from '@angular/router';

export interface SeoRouteData {
  description: string;
  canonical?: string;
  robots?: string;
  image?: string;
}

export const routes: Routes = [
  {
    path: '',
    title: 'Death Box | Free Online Multiplayer Drinking Card Game',
    data: {
      seo: {
        description:
          'Play Death Box, a free online multiplayer drinking card game of higher-or-lower guesses, stacked cards, sabotage, live chat, and bad decisions.',
        canonical: 'https://deathbox.app/',
        robots: 'index, follow',
        image: 'https://deathbox.app/images/deathbox-social-preview.webp',
      } satisfies SeoRouteData,
    },
    loadComponent: () =>
      import('./home/home.component').then(
        (m) => m.HomeComponent
      ),
  },

  {
    path: 'how-to-play',
    title: 'How to Play Death Box | Drinking Card Game Rules',
    data: {
      seo: {
        description:
          'Learn how to play Death Box, including higher-or-lower guesses, card stacks, drinking timers, player sabotage, deck resets, and remote play.',
        canonical: 'https://deathbox.app/how-to-play',
        robots: 'index, follow',
        image: 'https://deathbox.app/images/deathbox-social-preview.webp',
      } satisfies SeoRouteData,
    },
    loadComponent: () =>
      import('./how-to-play/how-to-play.component').then(
        (m) => m.HowToPlayComponent
      ),
  },

  {
    path: 'lobby/:id',
    title: 'Death Box Game Lobby',
    data: {
      seo: {
        description: 'Join your private Death Box game lobby.',
        robots: 'noindex, nofollow',
      } satisfies SeoRouteData,
    },
    loadComponent: () =>
      import('./lobby/lobby.component').then(
        (m) => m.LobbyComponent
      ),
  },

  {
    path: 'play/:id',
    title: 'Play Death Box',
    data: {
      seo: {
        description: 'Play a private multiplayer game of Death Box.',
        robots: 'noindex, nofollow',
      } satisfies SeoRouteData,
    },
    loadComponent: () =>
      import('./game/game.component').then(
        (m) => m.GameComponent
      ),
  },

  // {
  //   path: '**',
  //   title: 'Page Not Found | Death Box',
  //   data: {
  //     seo: {
  //       description: 'The requested Death Box page could not be found.',
  //       robots: 'noindex, nofollow',
  //     } satisfies SeoRouteData,
  //   },
  //   loadComponent: () =>
  //     import('./not-found/not-found.component').then(
  //       (m) => m.NotFoundComponent
  //     ),
  // },
];