import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { CardComponent } from './card/card.component';
import { StackComponent } from './stack/stack.component';
import { RemoveStacksComponent } from './remove-stacks/remove-stacks.component';
import { HighLowComponent } from './high-low/high-low.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModalComponent } from './modal/modal.component';
import { MatRippleModule } from '@angular/material/core';
import { PlayersComponent } from './players/players.component';
import { PlayersFormComponent } from './players-form/players-form.component';


@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    CardComponent,
    HighLowComponent,
    StackComponent,
    RemoveStacksComponent,
    ModalComponent,
    PlayersComponent,
    PlayersFormComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    RouterModule.forRoot([
      {
        path: '',
        component: GameComponent
      }
    ]),
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
