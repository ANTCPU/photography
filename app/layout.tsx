import type { Metadata } from 'next';
import '../styles/dashboard.css';

export const metadata: Metadata = {
  title: 'antcpu | Photography & Design',
  description: 'A showcase of creative work and serverless experiments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
