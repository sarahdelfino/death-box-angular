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
    title: 'How to Play (Rules & Tips)',
    loadComponent: () =>
      import('./rules/rules.component').then(m => m.RulesComponent),
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

