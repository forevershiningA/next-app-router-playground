import type { ReactNode } from 'react';
import { getServerSession } from '#/lib/auth/session';
import AdminNav from './_components/AdminNav';
import AdminLoginForm from './_components/AdminLoginForm';
import { AdminThemeProvider } from './_components/AdminThemeProvider';
import { ThemeToggle } from './_components/ThemeToggle';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession();

  if (!session || session.role !== 'admin') {
    return <AdminLoginForm />;
  }

  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="flex min-h-screen">
          <aside className="w-56 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <AdminNav />
          </aside>
          <div className="flex flex-1 flex-col overflow-hidden">
            <header className="flex items-center justify-end border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3">
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
