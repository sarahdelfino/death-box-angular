import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Free Online Multiplayer Drinking Game',
    loadComponent: () =>
      import('./start/start.component').then(m => m.StartComponent),
  },
  {
    path: 'how-to-play',
    title: 'How to Play',
    loadComponent: () =>
      import('./how-to-play/how-to-play.component').then(m => m.HowToPlayComponent),
  },
  {
    path: 'lobby/:id',
    title: 'Lobby',
    loadComponent: () =>
      import('./lobby/lobby.component').then(m => m.LobbyComponent),
  },
  {
    path: 'play/:id',
    title: 'Game',
    loadComponent: () =>
      import('./game/game.component').then(m => m.GameComponent),
  },
];

