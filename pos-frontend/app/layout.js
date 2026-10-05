import './globals.css';
import { AuthProvider } from '@/lib/auth';

export const metadata = { title: 'Billing – POS System' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
