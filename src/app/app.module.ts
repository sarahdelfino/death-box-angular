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
import { HighLowComponent } from './high-low/high-low.component';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GameService } from './game.service';
import { StartComponent } from './start/start.component';
import { LobbyComponent } from './lobby/lobby.component';
import { PlayersComponent } from './players/players.component';
import { DeckComponent } from './deck/deck.component';
import { InfoComponent } from './info/info.component';
import { CountComponent } from './count/count.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    CardComponent,
    HighLowComponent,
    StackComponent,
    StartComponent,
    LobbyComponent,
    PlayersComponent,
    DeckComponent,
    InfoComponent,
    CountComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    NgxGoogleAnalyticsModule.forRoot(environment.firebase.measurementId),
    NgxGoogleAnalyticsRouterModule,
    HttpClientModule,
    RouterModule.forRoot([
    {
        path: '',
        component: GameComponent
    }
], { relativeLinkResolution: 'legacy' }),
    BrowserAnimationsModule
  ],
  providers: [
    GameService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
