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
    title: 'Deathbox | Free Online Multiplayer Drinking Card Game',
    data: {
      seo: {
        description:
          'Play Deathbox, a free online multiplayer drinking card game of higher-or-lower guesses, stacked cards, sabotage, live chat, and bad decisions.',
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
    title: 'How to Play Deathbox | Drinking Card Game Rules',
    data: {
      seo: {
        description:
          'Learn how to play Deathbox, including higher-or-lower guesses, card stacks, drinking timers, player sabotage, deck resets, and remote play.',
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
    title: 'Deathbox Game Lobby',
    data: {
      seo: {
        description: 'Join your private Deathbox game lobby.',
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
    title: 'Play Deathbox',
    data: {
      seo: {
        description: 'Play a private multiplayer game of Deathbox.',
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
  //   title: 'Page Not Found | Deathbox',
  //   data: {
  //     seo: {
  //       description: 'The requested Deathbox page could not be found.',
  //       robots: 'noindex, nofollow',
  //     } satisfies SeoRouteData,
  //   },
  //   loadComponent: () =>
  //     import('./not-found/not-found.component').then(
  //       (m) => m.NotFoundComponent
  //     ),
  // },
];