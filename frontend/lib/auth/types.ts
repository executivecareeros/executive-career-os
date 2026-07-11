export interface AuthUser { id: string; email?: string; email_confirmed_at?: string }
export interface AuthSession { access_token: string; refresh_token: string; expires_in: number; expires_at?: number; user: AuthUser }
export interface AuthResult { ok: boolean; message?: string; requiresVerification?: boolean }
export interface OnboardingProfile { preferredName: string; currentRole: string; currentEmployer?: string; country: string; preferredLanguage: string; timezone: string; careerAmbition: string; atlasPromiseAccepted: boolean }
export interface CurrentExecutiveSession { user: AuthUser; accessToken: string; expiresAt?: number }
