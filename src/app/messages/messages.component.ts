import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  AfterViewInit,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { GameStore } from '../game.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
})
export class MessagesComponent implements AfterViewInit {
  private store = inject(GameStore);
  private destroyRef = inject(DestroyRef);

  @ViewChild('message') message!: ElementRef<HTMLInputElement>;

  @Input() gameId!: string;

  user = sessionStorage.getItem('player') ?? '';
  messages$ = this.store.messages$;

  ngAfterViewInit() {
    this.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.scrollToBottom();
      });
  }

  sendMessage(msg: string) {
    const text = msg.trim();
    if (!text) return;

    this.message.nativeElement.value = '';

    const timestamp = new Date().toISOString().replace(/[\.][0-9]*\w/g, '');

    this.store.sendMessage({
      gameId: this.gameId,
      player: this.user,
      message: text,
      timestamp,
    });
  }

  private scrollToBottom() {
    const container = document.querySelector('.chats');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
