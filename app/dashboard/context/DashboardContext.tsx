'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  DashboardContextValue,
  DashboardMetrics,
  PhotoAsset,
  UploadItem,
} from '../types';

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_METRICS: DashboardMetrics = {
  portfolioCount: 1284,
  storageUsedGb: 847,
  storageTotalGb: 2000,
  revenueUsd: 12840,
  revenueDeltaUsd: 340,
  antcoin: {
    balance: 2847.32,
    change24h: 12.4,
    change7d: 84.2,
    pending: 34.5,
    networkFee: 0.02,
    exchangeRate: 0.5,
    sparkline: [2600, 2640, 2610, 2680, 2720, 2700, 2760, 2790, 2810, 2847],
    recentTx: [
      {
        id: 'tx1',
        type: 'sale',
        description: 'Sunset_Golden_Hour_RAW.cr2',
        amount: 8.5,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx2',
        type: 'tip',
        description: 'Tip from @marcello_v',
        amount: 2.0,
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx3',
        type: 'license',
        description: 'Commercial License — Forbes',
        amount: 50.0,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tx4',
        type: 'sale',
        description: 'Urban_Abstract_04.jpg print',
        amount: 12.0,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
};

const SEED_ASSETS: PhotoAsset[] = [
  {
    id: 'a1',
    filename: 'Sunset_Golden_Hour_RAW.cr2',
    meta: '24.1 MP · f/2.8 · ISO 400',
    category: 'Nature',
    status: 'live',
    priceUsd: 120,
    antcoin: 8.5,
    exif: 'Sony A7IV · 85mm',
  },
  {
    id: 'a2',
    filename: 'Wedding_Reception_0182.CR2',
    meta: '30.4 MP · f/1.8 · ISO 800',
    category: 'Events',
    status: 'sold',
    priceUsd: 340,
    antcoin: 24.0,
    exif: 'Canon R5 · 50mm',
  },
  {
    id: 'a3',
    filename: 'Urban_Abstract_04.jpg',
    meta: '20.2 MP · f/8 · ISO 100',
    category: 'Urban',
    status: 'live',
    priceUsd: 85,
    antcoin: 6.0,
    exif: 'Fuji X-T5 · 23mm',
  },
  {
    id: 'a4',
    filename: 'Portrait_Studio_112.tiff',
    meta: '45.7 MP · f/4 · ISO 200',
    category: 'Portrait',
    status: 'review',
    priceUsd: 200,
    antcoin: 14.0,
    exif: 'Nikon Z9 · 105mm',
  },
  {
    id: 'a5',
    filename: 'Abstract_Urban_012.ARW',
    meta: '61 MP · f/5.6 · ISO 640',
    category: 'Abstract',
    status: 'draft',
    priceUsd: null,
    antcoin: null,
    exif: 'Sony A1 · 28mm',
  },
];

const SEED_UPLOADS: UploadItem[] = [
  { id: 'u1', filename: 'Wedding_Reception_0182.CR2', status: 'done', progress: 100 },
  { id: 'u2', filename: 'Sunset_Series_047.NEF', status: 'uploading', progress: 78 },
  { id: 'u3', filename: 'Abstract_Urban_012.ARW', status: 'queued', progress: 0 },
];

// ── Context ───────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [metrics] = useState<DashboardMetrics>(SEED_METRICS);
  const [assets] = useState<PhotoAsset[]>(SEED_ASSETS);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const addUpload = useCallback((item: UploadItem) => {
    setUploads((prev) => [item, ...prev]);
  }, []);

  const updateUpload = useCallback((id: string, patch: Partial<UploadItem>) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u))
    );
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        metrics,
        assets,
        uploads,
        sidebarCollapsed,
        activeSection,
        hasUnsavedChanges,
        setSidebarCollapsed,
        setActiveSection,
        setHasUnsavedChanges,
        addUpload,
        updateUpload,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
