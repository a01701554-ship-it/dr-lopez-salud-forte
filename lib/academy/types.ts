export type CourseStatus = 'draft' | 'published' | 'archived' | 'coming_soon';
export type AccessType = 'lifetime' | 'limited_days' | 'free';
export type VideoProvider = 'YOUTUBE' | 'CLOUDFLARE_STREAM' | 'cloudflare_stream' | 'none';
export type EntitlementStatus = 'active' | 'revoked' | 'suspended' | 'expired';
export type LessonProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type WebhookProcessStatus = 'success' | 'failed' | 'ignored';
export type UserRole = 'CUSTOMER' | 'INSTRUCTOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'LOCKED' | 'DISABLED';

export interface UserProfile {
  id: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  normalized_email?: string;
  phone?: string;
  password_hash?: string;
  role: UserRole;
  status?: UserStatus;
  email_verified: boolean;
  email_verified_at?: string | null;
  verification_token_hash?: string;
  verification_token_expires_at?: number;
  reset_token_hash?: string;
  reset_token_expires_at?: number;
  marketing_consent?: boolean;
  marketing_consent_at?: string;
  marketing_opted_out_at?: string;
  marketing_consent_source?: string;
  marketing_consent_version?: string;
  privacy_policy_version?: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  privacy_accepted?: boolean;
  privacy_accepted_at?: string;
  password_changed_at?: string;
  failed_login_attempts?: number;
  locked_until?: number;
  mfa_enabled?: boolean;
  mfa_secret?: string;
  promoted_by?: string;
  promoted_at?: string;
  created_at: string;
  updated_at?: string;
  last_login_at?: string;
  shopifyCustomerGid?: string;
}

export interface Attachment {
  id: string;
  lessonId: string;
  title: string;
  storageKey: string;
  mimeType: string;
  fileSizeLabel?: string;
  position: number;
  status: 'published' | 'draft';
}

export interface Lesson {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  summary: string;
  position: number;
  durationSeconds: number;
  videoProvider: VideoProvider;
  videoExternalId?: string;
  privateVideoUid: string;
  thumbnailUrl?: string;
  videoProviderMetadata?: Record<string, any>;
  isPreview: boolean;
  status: CourseStatus;
  releaseAt?: string | null;
  transcript?: string;
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  position: number;
  status: CourseStatus;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  shop?: string;
  shopifyProductGid?: string;
  shopifyVariantGid?: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  shortDescription: string;
  category: 'salud_mujer' | 'salud_hombre' | 'bienestar' | 'prevencion' | 'habitos' | 'educacion_medica';
  categoryLabel: string;
  level: 'Introductorio' | 'Intermedio' | 'Especializado';
  durationMinutes: number;
  lessonCount: number;
  status: CourseStatus;
  accessType: AccessType;
  accessDurationDays?: number | null;
  launchDate?: string;
  launchStatus: 'available' | 'coming_soon' | 'closed';
  previewEnabled: boolean;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  sku?: string;
  instructor: import('./instructor').InstructorProfile;
  image: string;
  imageFallback: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  imagePosition: string;
  imagePriority: boolean;
  coverImage: string;
  coverAlt: string;
  disclaimerShort: string;
  disclaimerLong: string;
  learningOutcomes: string[];
  targetAudience: string[];
  includedFeatures: string[];
  faqs: Array<{ question: string; answer: string }>;
  modules?: Module[];
  clinicalDescription?: string;
  badgeLabel?: string;
  heroImage?: string;
  heroVideoPreviewUrl?: string;
  shopifyHandle?: string;
  orderWeight?: number;
  imageId?: string;
  createdAt?: string;
  updatedAt?: string;
  salesPromise?: string;
  recognitionPoints?: string[];
  beforeState?: string[];
  afterState?: string[];
  notFor?: string[];
  ctaLabel?: string;
}

export interface CourseProductMapping {
  shop: string;
  shopifyProductGid: string;
  shopifyVariantGid: string;
  courseId: string;
  active: boolean;
}

export interface Entitlement {
  id: string;
  shop: string;
  customerGid: string;
  customerEmail: string;
  customerName?: string;
  courseId: string;
  orderGid?: string;
  orderNumber: string;
  lineItemGid?: string;
  status: EntitlementStatus;
  grantedAt: string;
  startsAt: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
  revocationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  customerGid: string;
  courseId: string;
  lessonId: string;
  status: LessonProgressStatus;
  lastPositionSeconds: number;
  startedAt: string;
  completedAt?: string | null;
  updatedAt: string;
}

export interface ProcessedWebhook {
  id: string;
  shop: string;
  webhookId: string;
  eventId?: string;
  topic: string;
  receivedAt: string;
  processedAt: string;
  status: WebhookProcessStatus;
  errorCode?: string | null;
  payloadSummary?: string;
}

export interface AccessAudit {
  id: string;
  shop: string;
  customerGid: string;
  courseId?: string;
  lessonId?: string;
  action:
    | 'catalog_view'
    | 'library_view'
    | 'lesson_access'
    | 'video_token_request'
    | 'attachment_download'
    | 'attachment_uploaded'
    | 'attachment_renamed'
    | 'attachment_reordered'
    | 'attachment_replaced'
    | 'attachment_deleted'
    | 'entitlement_granted'
    | 'entitlement_revoked'
    | 'user_login'
    | 'youtube_video_playback'
    | 'cloudflare_token_request';
  result: 'granted' | 'denied' | 'error';
  reason?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface StudentSession {
  customerGid: string;
  email: string;
  name: string;
  verified: boolean;
  expiresAt: number;
}

export interface StreamTokenResponse {
  token: string;
  playbackUrl: string;
  expiresAt: number;
  durationSeconds: number;
  watermarkText?: string;
}

export type TestimonialStatus = 'draft' | 'pending_consent' | 'published' | 'hidden' | 'inactive' | 'consent_withdrawn';
export type TestimonialNameFormat = 'full' | 'initials' | 'anonymous';

export interface VideoTestimonial {
  id: string;
  videoProvider: 'cloudflare' | 'youtube' | 'url' | 'video';
  videoId: string;
  videoUrl?: string;
  posterUrl: string;
  displayName: string;
  internalName?: string;
  nameFormat: TestimonialNameFormat;
  publicLabel?: string;
  shortDescription?: string;
  sortOrder: number;
  status: TestimonialStatus;
  consentConfirmed: boolean;
  consentDate: string;
  consentExpiration?: string | null;
  consentWithdrawnAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
