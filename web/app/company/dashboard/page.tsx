'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import Link from 'next/link';

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    viewsThisMonth: 0,
    applicationsThisWeek: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'COMPANY') {
      router.push('/dashboard');
      return;
    }
    
    // Sample stats
    setStats({
      totalJobs: 12,
      activeJobs: 8,
      totalApplications: 156,
      pendingApplications: 23,
      viewsThisMonth: 1240,
      applicationsThisWeek: 18,
    });
  }, [user, router]);

  if (!user || user.role !== 'COMPANY') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Hoş Geldiniz, {user.companyProfile?.companyName || 'Şirket'}!
          </h1>
          <p className="text-blue-100">
            İşe alım süreçlerinizi buradan yönetebilirsiniz.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/company/jobs/new"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Yeni İlan Ver</h3>
            <p className="text-sm text-gray-600">İş ilanı oluştur</p>
          </Link>

          <Link
            href="/company/applications"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Başvuruları Gör</h3>
            <p className="text-sm text-gray-600">{stats.pendingApplications} bekliyor</p>
          </Link>

          <Link
            href="/company/profile"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Profili Düzenle</h3>
            <p className="text-sm text-gray-600">Şirket bilgileri</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam İlan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                <p className="text-sm text-green-600 mt-1">{stats.activeJobs} aktif</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Başvuru</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                <p className="text-sm text-yellow-600 mt-1">{stats.pendingApplications} bekliyor</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bu Ay Görüntüleme</p>
                <p className="text-3xl font-bold text-gray-900">{stats.viewsThisMonth}</p>
                <p className="text-sm text-blue-600 mt-1">+{stats.applicationsThisWeek} bu hafta</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Son Başvurular</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">AY</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Ahmet Yılmaz</p>
                    <p className="text-xs text-gray-500">Frontend Developer pozisyonuna</p>
                  </div>
                  <span className="text-xs text-gray-400">{i}s önce</span>
                </div>
              ))}
            </div>
            <Link href="/company/applications" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium">
              Tümünü Gör →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Aktif İlanlarınız</h3>
            <div className="space-y-3">
              {[
                { title: 'Frontend Developer', applications: 23, views: 156 },
                { title: 'Backend Developer', applications: 18, views: 142 },
                { title: 'UI/UX Designer', applications: 15, views: 98 },
                { title: 'DevOps Engineer', applications: 12, views: 87 },
              ].map((job, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <span className="text-xs text-gray-500">{job.views} görüntüleme</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>📋 {job.applications} başvuru</span>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/company/jobs" className="block mt-4 text-center text-blue-600 hover:text-blue-700 font-medium">
              Tüm İlanlar →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
