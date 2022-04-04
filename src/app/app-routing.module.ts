import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { GameComponent } from './game/game.component';
import { LobbyComponent } from './lobby/lobby.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { StartComponent } from './start/start.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'sign-in', component: LoginComponent, },
  { path: 'sign-up', component: SignupComponent, },
  { path: 'forgot-password', component: ForgotPasswordComponent, },
  { path: 'verify-email-address', component: VerifyEmailComponent, },
  { path: 'dashboard', component: StartComponent, },
  { path: 'lobby/:id', component: LobbyComponent, },
  { path: 'play/:id', component: GameComponent, },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
