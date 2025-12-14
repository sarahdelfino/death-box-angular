
import { Injectable, inject } from '@angular/core';
import { Database, ref, push, set, serverTimestamp } from '@angular/fire/database';

export interface FeedbackInput {
  type: 'bug' | 'idea' | 'other';
  message: string;
  canContact?: boolean;
  email?: string | null;
  screen?: 'start' | 'lobby' | 'game' | 'other';
  gameId?: string | null;
  sessionPlayer?: string | null;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private db = inject(Database);

  submit(feedback: FeedbackInput): Promise<void> {
    const feedbackRef = push(ref(this.db, 'feedback'));

    const payload = {
      ...feedback,
      createdAt: serverTimestamp(),
      userAgent: navigator.userAgent,
    };

    
    return set(feedbackRef, payload) as Promise<void>;
  }
}