import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { CardComponent } from './card/card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HighLowComponent } from './high-low/high-low.component';
import { MatDialogModule } from '@angular/material/dialog';
import { StackComponent } from './stack/stack.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    CardComponent,
    HighLowComponent,
    StackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule,
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
