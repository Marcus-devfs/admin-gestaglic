export interface DashboardMetrics {
  users: { total: number; newLast7Days: number };
  infra: {
    totalDocuments: number;
    users: number;
    medicoes: number;
    estimatedStorageMB: number;
    mongoLimitMB: number;
    storageUsagePct: number;
    vercelAnalyticsUrl: string | null;
  };
  financial: {
    pixPrice: number;
    generated: number;
    paid: number;
    revenue: number;
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
  status: "generated" | "paid";
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
