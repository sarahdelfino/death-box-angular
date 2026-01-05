import { Component, Input, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { FeedbackService, FeedbackInput } from '../feedback.service';
import { AnalyticsService } from '../analytics.service';

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
  feedbackForm: FormGroup;
  feedbackSubmitting = false;
  feedbackSent = false;

  private readonly FEEDBACK_THROTTLE_MS = 30_000;

  private fb = inject(FormBuilder);
  private feedbackService = inject(FeedbackService);
  private analytics = inject(AnalyticsService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.feedbackForm = this.fb.group({
      type: ['bug', Validators.required],
      message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
      canContact: [false],
      dumb: [''],
      email: [{ value: '', disabled: true }, [Validators.email, Validators.maxLength(80)]],
    });

    this.feedbackForm.get('canContact')?.valueChanges.subscribe((val) => {
      const emailCtrl = this.feedbackForm.get('email');
      if (!emailCtrl) return;
      if (val) emailCtrl.enable();
      else {
        emailCtrl.disable();
        emailCtrl.reset('');
      }
    });
  }

  toggleFeedback() {
    this.showFeedback = !this.showFeedback;

    if (this.showFeedback) {
      this.analytics.track('feedback_opened', {
        screen: this.screen,
        game_id: this.gameId || null,
      });
    }
  }

  submitFeedback() {
    if (this.feedbackForm.invalid || this.feedbackSubmitting) return;

    const formValue = this.feedbackForm.getRawValue() as {
      type: FeedbackInput['type'];
      message: string;
      canContact: boolean;
      email: string;
      dumb: string;
    };

    // honeypot
    if (formValue.dumb && formValue.dumb.trim().length > 0) {
      this.analytics.track('feedback_spam_honeypot', { screen: this.screen });
      return;
    }

    // throttle (SSR-safe)
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

        this.feedbackForm.patchValue({
          type: 'bug',
          message: '',
          canContact: false,
          email: '',
          dumb: '',
        });

        this.analytics.track('feedback_submitted', {
          screen: this.screen,
          type: payload.type,
          has_email: !!payload.email,
        });
      })
      .catch((err) => {
        this.feedbackSubmitting = false;
        console.error('Feedback submit error', err);
      });
  }
}
