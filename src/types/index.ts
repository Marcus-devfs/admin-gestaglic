export interface FinancialSummary {
  pixPrice: number;
  received: {
    gross: number;
    net: number;
    fees: number;
    count: number;
    syncedCount: number;
  };
  pending: {
    gross: number;
    count: number;
  };
  premiumUsers: number;
}

export interface PremiumSettings {
  premiumPrice: number;
  freePdfLimit: number;
  updatedAt?: string;
  asaasMinCharge?: number;
  asaasSandbox?: boolean;
}

export interface DashboardMetrics {
  users: { total: number; newLast7Days: number };
  infra: {
    totalDocuments: number;
    users: number;
    medicoes: number;
    pixPayments: number;
    accessLogs: number;
    estimatedStorageMB: number;
    dataSizeMB: number | null;
    mongoObjects: number | null;
    mongoLimitMB: number;
    storageUsagePct: number;
    storageSource: "mongodb" | "estimate";
    activity: {
      logins7d: number;
      pdfDownloads7d: number;
      activeUsers7d: number;
    };
    vercelAnalyticsUrl: string | null;
  };
  financial: {
    pixPrice: number;
    generated: number;
    paid: number;
    revenue: number;
    revenueNet: number;
    asaasFees: number;
    paidWithFeesSynced: number;
    pendingGross: number;
    pendingCount: number;
    premiumUsers: number;
  };
  notifications: {
    enabled: number;
    pushSubscriptions: number;
  };
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  telephone?: string;
  gender?: string;
  birthDate?: string;
  is_premium?: boolean;
  pdf_downloads_count?: number;
  createdAt?: string;
  preferences?: {
    notificationsEnabled?: boolean;
    reminders?: { period: string; time: string; label: string }[];
  };
  pushSubscriptions?: { endpoint: string; createdAt?: string }[];
}

export interface Medicao {
  _id: string;
  period: string;
  value: number;
  date: string;
  diet?: boolean;
  food?: string;
}

export interface PixPayment {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  amount: number;
  netAmount?: number | null;
  feeAmount?: number | null;
  paymentMethod?: "pix" | "card";
  status: "generated" | "pending" | "paid" | "expired" | "cancelled";
  createdAt: string;
  paidAt?: string;
}

export interface AccessLog {
  _id: string;
  action: "login" | "session_restore" | "pdf_download" | "register";
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface UserDetailResponse {
  user: AdminUser;
  medicoes: Medicao[];
  payments: PixPayment[];
  accessLogs: AccessLog[];
  stats: {
    totalMedicoes: number;
    avgGlucose: number;
    pushDevices: number;
    notificationsEnabled: boolean;
    lastLoginAt: string | null;
    pdfDownloads: number;
  };
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: string;
  readMinutes: number;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
}

export interface ForumPostAdmin {
  _id: string;
  title: string;
  body: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  hidden: boolean;
  reportCount: number;
  userId: { _id: string; name: string; email: string };
  createdAt: string;
}

export interface ForumReport {
  _id: string;
  targetType: "post" | "comment";
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  reporterId: { name: string; email: string };
  postId: { title: string; category: string };
  createdAt: string;
}

export interface FeedbackItem {
  _id: string;
  userId: { _id: string; name: string; email: string } | string;
  category: "feedback" | "help" | "bug";
  message: string;
  status: "open" | "read" | "resolved";
  createdAt: string;
}

export interface LpMetrics {
  days: number;
  pageViews: number;
  uniqueSessions: number;
  ctaClicks: number;
  conversionRate: number;
  byDay: { date: string; pageViews: number; ctaClicks: number }[];
  bySource: { source: string; pageViews: number; uniqueSessions: number }[];
  topPaths: { path: string; count: number }[];
  byEvent: { event: string; count: number }[];
}
