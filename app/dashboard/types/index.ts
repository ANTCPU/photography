export type SystemStatus = 'operational' | 'degraded' | 'error';

export interface SystemService {
  label: string;
  status: SystemStatus;
  detail: string;
}

export type PhotoStatus = 'live' | 'draft' | 'sold' | 'review';

export interface PhotoAsset {
  id: string;
  filename: string;
  meta: string; // e.g. "24.1 MP · f/2.8 · ISO 400"
  category: string;
  status: PhotoStatus;
  priceUsd: number | null;
  antcoin: number | null;
  exif: string;
  thumbnailUrl?: string;
}

export interface AntcoinTransaction {
  id: string;
  type: 'sale' | 'tip' | 'license';
  description: string;
  amount: number; // positive = credit
  timestamp: string; // ISO string
}

export interface AntcoinStat {
  balance: number;
  change24h: number;
  change7d: number;
  pending: number;
  networkFee: number;
  exchangeRate: number; // USD per ANT
  sparkline: number[];  // last N balance snapshots
  recentTx: AntcoinTransaction[];
}

export interface UploadItem {
  id: string;
  filename: string;
  status: 'done' | 'uploading' | 'queued' | 'error';
  progress: number; // 0–100
}

export interface DashboardMetrics {
  portfolioCount: number;
  storageUsedGb: number;
  storageTotalGb: number;
  revenueUsd: number;
  revenueDeltaUsd: number;
  antcoin: AntcoinStat;
}

export interface DashboardContextValue {
  metrics: DashboardMetrics | null;
  assets: PhotoAsset[];
  uploads: UploadItem[];
  sidebarCollapsed: boolean;
  activeSection: string;
  hasUnsavedChanges: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  setActiveSection: (s: string) => void;
  setHasUnsavedChanges: (v: boolean) => void;
  addUpload: (item: UploadItem) => void;
  updateUpload: (id: string, patch: Partial<UploadItem>) => void;
}
