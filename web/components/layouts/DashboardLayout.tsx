'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isStudent = user?.role === 'STUDENT';
  const isCompany = user?.role === 'COMPANY';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR';

  const studentMenu = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/profile', label: 'Profilim', icon: '👤' },
    { href: '/jobs', label: 'İş İlanları', icon: '💼' },
    { href: '/saved-jobs', label: 'Kayıtlı İlanlar', icon: '❤️' },
    { href: '/applications', label: 'Başvurularım', icon: '📋' },
    { href: '/messages', label: 'Mesajlar', icon: '💬' },
    { href: '/notifications', label: 'Bildirimler', icon: '🔔' },
    { href: '/settings', label: 'Ayarlar', icon: '⚙️' },
  ];

  const companyMenu = [
    { href: '/company/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/company/profile', label: 'Şirket Profili', icon: '🏢' },
    { href: '/company/jobs', label: 'İlanlarım', icon: '📝' },
    { href: '/company/jobs/new', label: 'Yeni İlan', icon: '➕' },
    { href: '/company/applications', label: 'Başvurular', icon: '📥' },
    { href: '/messages', label: 'Mesajlar', icon: '💬' },
    { href: '/notifications', label: 'Bildirimler', icon: '🔔' },
    { href: '/company/settings', label: 'Ayarlar', icon: '⚙️' },
  ];

  const adminMenu = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/admin/users', label: 'Kullanıcılar', icon: '👥' },
    { href: '/admin/companies', label: 'Şirket Onayları', icon: '✅' },
    { href: '/admin/reports', label: 'Şikayetler', icon: '⚠️' },
    { href: '/admin/logs', label: 'Loglar', icon: '📊' },
    { href: '/admin/settings', label: 'Site Ayarları', icon: '🛠️' },
  ];

  const menuItems = isAdmin ? adminMenu : isCompany ? companyMenu : studentMenu;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition">
                KampüsConnect
              </Link>
              <Link 
                href="/" 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Ana Sayfaya Dön"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Ana Sayfa</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-600">Hoşgeldin,</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.studentProfile?.firstName || user?.companyProfile?.companyName || user?.email}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out mt-16 md:mt-0`}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info Card */}
          <div className="p-4 border-t">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? 'Admin' : isCompany ? 'Şirket' : 'Öğrenci'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
