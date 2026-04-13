// app/dashboard/layout.tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import '../../styles/dashboard.css';
import { DashboardProvider } from './context/DashboardContext';
import Sidebar from './components/SideBar';
import TopBar from './components/TopBar';

export const metadata: Metadata = {
  title: 'Amanda Studio — Dashboard',
  description: 'Internal control center for Amanda Photography',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('upload_token')?.value;

  if (!token || token !== process.env.UPLOAD_SECRET) {
    redirect('/login');
  }

  return (
    <DashboardProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <TopBar />
        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar />
          <main style={{ flex: 1, overflow: 'auto' }}>
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
