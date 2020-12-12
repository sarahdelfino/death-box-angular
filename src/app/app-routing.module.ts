import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { PlayersFormComponent } from './players-form/players-form.component';

const routes: Routes = [
  { path: 'welcome', component: PlayersFormComponent },
  { path: 'play', component: GameComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
