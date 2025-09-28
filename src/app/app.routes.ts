import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Home', loadComponent: () => import('./start/start.component').then(m => m.StartComponent) },
  { path: 'lobby/:id', title: 'Lobby', loadComponent: () => import('./lobby/lobby.component').then(m => m.LobbyComponent) },
  { path: 'play/:id', loadComponent: () => import('./game/game.component').then(m => m.GameComponent) },
];
