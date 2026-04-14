import { Component, Input, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { FeedbackService, FeedbackInput } from '../feedback.service';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { FirebaseApp } from '@angular/fire/app';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  standalone: true,
  imports: [ReactiveFormsModule],
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent {
  @Input() screen: 'start' | 'lobby' | 'game' | 'other' = 'other';
  @Input() gameId: string | null = null;

  showFeedback = false;
  feedbackSubmitting = false;
  feedbackSent = false;

  private readonly FEEDBACK_THROTTLE_MS = 30_000;

  private fb = inject(FormBuilder);
  private feedbackService = inject(FeedbackService);
  private platformId = inject(PLATFORM_ID);

  feedbackForm: FormGroup = this.fb.group({
    type: ['bug', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(1000)]],
    canContact: [false],
    email: [''],
    dumb: [''],
  });

  constructor(private firebaseApp: FirebaseApp) {
    this.feedbackForm.get('canContact')!.valueChanges.subscribe((canContact: boolean) => {
      const emailControl = this.feedbackForm.get('email')!;

      if (canContact) {
        emailControl.setValidators([Validators.required, Validators.email]);
      } else {
        emailControl.clearValidators();
        emailControl.setValue('', { emitEvent: false });
      }

      emailControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  toggleFeedback(): void {
    this.showFeedback = !this.showFeedback;

    if (this.showFeedback) {
      logEvent(getAnalytics(this.firebaseApp), 'feedback_opened', {});
    }
  }

  submitFeedback(): void {
    if (this.feedbackForm.invalid || this.feedbackSubmitting) return;

    const formValue = this.feedbackForm.getRawValue() as {
      type: FeedbackInput['type'];
      message: string;
      canContact: boolean;
      email: string;
      dumb: string;
    };

    if (formValue.dumb && formValue.dumb.trim().length > 0) {
      logEvent(getAnalytics(this.firebaseApp), 'feedback_spam_honeypot', { screen: this.screen });
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const lastTs = Number(localStorage.getItem('dbx_last_feedback_ts') || 0);
      const now = Date.now();
      if (now - lastTs < this.FEEDBACK_THROTTLE_MS) return;
      localStorage.setItem('dbx_last_feedback_ts', String(now));
    }

    this.feedbackSubmitting = true;
    this.feedbackSent = false;

    const payload: FeedbackInput = {
      type: formValue.type,
      message: formValue.message.trim(),
      canContact: !!formValue.canContact,
      email: formValue.canContact ? formValue.email?.trim() || null : null,
      screen: this.screen,
      gameId: this.gameId,
      sessionPlayer: isPlatformBrowser(this.platformId)
        ? (sessionStorage.getItem('player') ?? null)
        : null,
    };

    this.feedbackService
      .submit(payload)
      .then(() => {
        this.feedbackSubmitting = false;
        this.feedbackSent = true;

        this.feedbackForm.reset({
          type: 'bug',
          message: '',
          canContact: false,
          email: '',
          dumb: '',
        });

        logEvent(getAnalytics(this.firebaseApp), 'feedback_submitted', {});
      })
      .catch((err) => {
        this.feedbackSubmitting = false;
        console.error('Feedback submit error', err);
      });
  }
}