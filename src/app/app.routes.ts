import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Deathbox', loadComponent: () => import('./start/start.component').then(m => m.StartComponent) },
  { path: 'lobby/:id', title: 'Lobby', loadComponent: () => import('./lobby/lobby.component').then(m => m.LobbyComponent) },
  { path: 'play/:id', title: 'Deathbox', loadComponent: () => import('./game/game.component').then(m => m.GameComponent) },
];
