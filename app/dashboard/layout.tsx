import type { Metadata } from 'next';
import '../../styles/dashboard.css';
import { DashboardProvider } from './context/DashboardContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

export const metadata: Metadata = {
  title: 'Amanda Studio — Dashboard',
  description: 'Internal control center for Amanda Photography',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--db-bg)',
      }}
    >
      <DashboardProvider>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar />
          <main style={{ flex: 1, padding: '20px 24px', overflowX: 'hidden' }}>
            {children}
          </main>
        </div>
      </DashboardProvider>
    </div>
  );
}
