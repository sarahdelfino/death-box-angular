import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { CardComponent } from './card/card.component';
import { StackComponent } from './stack/stack.component';
import { RemoveStacksComponent } from './remove-stacks/remove-stacks.component';
import { HighLowComponent } from './high-low/high-low.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ModalComponent } from './modal/modal.component';
import { MatRippleModule } from '@angular/material/core';
import { GameService } from './game.service';
import { StartComponent } from './start/start.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PlayersComponent } from './players/players.component';
import { DeckComponent } from './deck/deck.component';
import { InfoComponent } from './info/info.component';
import { CountComponent } from './count/count.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    CardComponent,
    HighLowComponent,
    StackComponent,
    RemoveStacksComponent,
    ModalComponent,
    StartComponent,
    LobbyComponent,
    PlayersComponent,
    DeckComponent,
    InfoComponent,
    CountComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    MatInputModule,
    MatRippleModule,
    HttpClientModule,
    RouterModule.forRoot([
      {
        path: '',
        component: GameComponent
      }
    ]),
    BrowserAnimationsModule
  ],
  providers: [
    GameService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
