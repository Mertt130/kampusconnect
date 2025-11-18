'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  pendingCompanies: number;
  pendingReports: number;
  recentUsers: any[];
  recentJobs: any[];
  monthlyStats: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingCompanies: 0,
    pendingReports: 0,
    recentUsers: [],
    recentJobs: [],
    monthlyStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'MODERATOR') {
      router.push('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, router]);

  const fetchDashboardData = async () => {
    try {
      const response: any = await api.getAdminDashboard();
      if (response?.success) {
        setStats(response.data);
      } else {
        // Use sample data
        setStats({
          totalUsers: 156,
          totalStudents: 120,
          totalCompanies: 35,
          totalJobs: 89,
          totalApplications: 342,
          pendingCompanies: 5,
          pendingReports: 3,
          recentUsers: [
            { id: '1', email: 'yeni@student.com', role: 'STUDENT', createdAt: new Date().toISOString() },
            { id: '2', email: 'firma@company.com', role: 'COMPANY', createdAt: new Date().toISOString() },
          ],
          recentJobs: [
            { id: '1', title: 'Frontend Developer', company: { companyProfile: { companyName: 'TechCorp' } }, createdAt: new Date().toISOString() },
            { id: '2', title: 'Backend Developer', company: { companyProfile: { companyName: 'DataSoft' } }, createdAt: new Date().toISOString() },
          ],
          monthlyStats: [
            { month: 'Oca', users: 45, jobs: 23 },
            { month: 'Şub', users: 52, jobs: 28 },
            { month: 'Mar', users: 61, jobs: 35 },
            { month: 'Nis', users: 73, jobs: 42 },
            { month: 'May', users: 89, jobs: 51 },
            { month: 'Haz', users: 105, jobs: 67 },
          ],
        });
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Hoş geldiniz, {user?.email}! Sistem yönetim panelindesiniz.
          </p>
        </div>

        {/* Quick Actions */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-900">Bekleyen İşlemler</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {stats.pendingCompanies} şirket onayı ve {stats.pendingReports} şikayet bekliyor.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/admin/companies"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                >
                  Şirket Onayları
                </Link>
                <Link
                  href="/admin/reports"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                >
                  Şikayetler
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Öğrenciler</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Şirketler</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalCompanies}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">İş İlanları</p>
                <p className="text-3xl font-bold text-orange-600">{stats.totalJobs}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Growth Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Aylık Büyüme</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {stats.monthlyStats.map((stat, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col gap-1">
                    <div
                      className="bg-blue-500 rounded-t"
                      style={{ height: `${(stat.users / 120) * 200}px` }}
                      title={`Kullanıcı: ${stat.users}`}
                    />
                    <div
                      className="bg-green-500 rounded-b"
                      style={{ height: `${(stat.jobs / 80) * 200}px` }}
                      title={`İlan: ${stat.jobs}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{stat.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Kullanıcılar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">İş İlanları</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Yeni kullanıcı kaydı: student123@example.com</p>
                  <p className="text-xs text-gray-500">5 dakika önce</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Yeni iş ilanı: Frontend Developer - TechCorp</p>
                  <p className="text-xs text-gray-500">15 dakika önce</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Şirket onay bekliyor: NewStartup Ltd.</p>
                  <p className="text-xs text-gray-500">1 saat önce</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Yeni şikayet: Spam içerik bildirimi</p>
                  <p className="text-xs text-gray-500">2 saat önce</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users & Jobs Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Son Kayıtlar</h3>
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm">
                Tümünü Gör →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Kullanıcı</th>
                    <th className="text-left py-2">Tip</th>
                    <th className="text-left py-2">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.slice(0, 5).map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'STUDENT' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {user.role === 'STUDENT' ? 'Öğrenci' : 'Şirket'}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Son İlanlar</h3>
              <Link href="/admin/jobs" className="text-blue-600 hover:text-blue-700 text-sm">
                Tümünü Gör →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Pozisyon</th>
                    <th className="text-left py-2">Şirket</th>
                    <th className="text-left py-2">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentJobs.slice(0, 5).map((job) => (
                    <tr key={job.id} className="border-b">
                      <td className="py-2">{job.title}</td>
                      <td className="py-2">{job.company?.companyProfile?.companyName}</td>
                      <td className="py-2 text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {user?.role === 'SUPER_ADMIN' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Yönetim İşlemleri</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/admin/users"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-sm font-medium">Kullanıcı Yönetimi</span>
              </Link>
              
              <Link
                href="/admin/companies"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Şirket Onayları</span>
              </Link>
              
              <Link
                href="/admin/reports"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-8 h-8 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">Şikayetler</span>
              </Link>
              
              <Link
                href="/admin/settings"
                className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Site Ayarları</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
