import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PlayersFormComponent } from './players-form/players-form.component';
import { StartComponent } from './start/start.component';

const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'lobby/:id', component: LobbyComponent, },
  { path: 'play/:id', component: GameComponent, },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
