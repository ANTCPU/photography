import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '../styles/dashboard.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "antcpu | Photography & Design",
  description: "A showcase of creative work and serverless experiments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav style={{ padding: '2rem', borderBottom: '1px solid #eaeaea' }}>
          <strong>antcpu</strong>
        </nav>
        
        <main>{children}</main>
        
        <footer style={{ padding: '2rem', marginTop: '4rem', textAlign: 'center' }}>
          <p>© {new Date().getFullYear()} antcpu</p>
        </footer>
      </body>
    </html>
  );
}
