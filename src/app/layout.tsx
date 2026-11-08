import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import '@/styles/style.css';
import '@/styles/blog.css';
import '@/styles/profile.css';
import '@/styles/dashboard.css';
import '@/styles/admin.css';
import { AuthProvider } from '@/context/auth-context';
import { ToastProvider } from '@/context/toast-context';
import { AuthModals } from '@/components/AuthModals';
import { BackToTop } from '@/components/BackToTop';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'FindWorker — A portfolio-first directory for independent talent',
  description:
    'Discover independent digital talent by the work they make. Explore thoughtful portfolios from designers, developers, writers, and strategists, then connect directly.',
  keywords:
    'FindWorker, freelance designers, web developers, digital marketers, content writers, creative portfolio directory, independent talent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
            <AuthModals />
            <BackToTop />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

