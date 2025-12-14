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

  // basic anti-spam controls
  private readonly MAX_MESSAGE_LENGTH = 240;
  private readonly MIN_INTERVAL_MS = 800;
  private lastSentAt = 0;

  ngAfterViewInit() {
    this.messages$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.scrollToBottom();
      });
  }

  private sanitize(input: string | null | undefined): string {
    // trim + collapse internal whitespace
    return (input ?? '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  sendMessage(msg: string) {
    // require a known player name
    if (!this.user) {
      return;
    }

    // simple rate limiting
    const now = Date.now();
    if (now - this.lastSentAt < this.MIN_INTERVAL_MS) {
      return;
    }

    let text = this.sanitize(msg);
    if (!text) {
      // ignore empty / whitespace-only messages
      this.clearInput();
      return;
    }

    // enforce max length
    if (text.length > this.MAX_MESSAGE_LENGTH) {
      text = text.slice(0, this.MAX_MESSAGE_LENGTH);
    }

    this.lastSentAt = now;

    const timestamp = new Date()
      .toISOString()
      .replace(/[\.][0-9]*\w/g, '');

    this.store.sendMessage({
      gameId: this.gameId,
      player: this.user,
      message: text,
      timestamp,
    });

    this.clearInput();
  }

  private clearInput() {
    if (this.message?.nativeElement) {
      this.message.nativeElement.value = '';
    }
  }

  private scrollToBottom() {
    const container = document.querySelector('.chats');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}