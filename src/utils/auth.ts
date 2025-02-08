import { config } from '../services/config';
import type { AllowedEmail } from '../services/config';

export function isAllowedEmail(email: string): email is AllowedEmail {
  return config.allowedEmails.includes(email as AllowedEmail);
}

export function getStoredToken(): string | null {
  return localStorage.getItem('googleToken');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('googleToken', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('googleToken');
}