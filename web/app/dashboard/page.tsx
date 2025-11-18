'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';

interface Stats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  profileCompleteness: number;
  savedJobs: number;
}

interface RecommendedJob {
  id: string;
  title: string;
  company: {
    companyProfile: {
      companyName: string;
      logoUrl?: string;
    };
  };
  location: string;
  jobType: string;
  createdAt: string;
}

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    profileCompleteness: 0,
    savedJobs: 0,
  });
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user?.role === 'COMPANY') {
      router.push('/company/dashboard');
    } else if (user?.role === 'SUPER_ADMIN' || user?.role === 'MODERATOR') {
      router.push('/admin/dashboard');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch applications stats
      const applicationsRes = await api.getMyApplications();
      if (applicationsRes.success) {
        const applications = applicationsRes.data;
        setStats(prev => ({
          ...prev,
          totalApplications: applications.length,
          pendingApplications: applications.filter((a: any) => a.status === 'PENDING').length,
          acceptedApplications: applications.filter((a: any) => a.status === 'ACCEPTED').length,
          rejectedApplications: applications.filter((a: any) => a.status === 'REJECTED').length,
        }));
      }

      // Fetch recommended jobs
      const jobsRes = await api.getJobs({ limit: 6 });
      if (jobsRes.success) {
        setRecommendedJobs(jobsRes.data);
      }

      // Calculate profile completeness
      if (user?.studentProfile) {
        const profile = user.studentProfile;
        let completed = 0;
        const totalFields = 10;
        
        if (profile.firstName) completed++;
        if (profile.lastName) completed++;
        if (profile.university) completed++;
        if (profile.department) completed++;
        if (profile.graduationYear) completed++;
        if (profile.about) completed++;
        if (profile.skills?.length > 0) completed++;
        if (profile.cvUrl) completed++;
        if (profile.avatarUrl) completed++;
        if (profile.phone) completed++;
        
        setStats(prev => ({
          ...prev,
          profileCompleteness: Math.round((completed / totalFields) * 100),
        }));
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Hoş geldin, {user?.studentProfile?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Dashboard'ından başvurularını takip edebilir, profilini güncelleyebilir ve yeni iş fırsatlarını keşfedebilirsin.
          </p>
        </div>

        {/* Profile Completeness */}
        {stats.profileCompleteness < 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-yellow-900">Profilini Tamamla</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Profilin %{stats.profileCompleteness} tamamlandı. Tam profil ile başvuru şansını artır!
                </p>
              </div>
              <Link
                href="/profile"
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
              >
                Profili Tamamla
              </Link>
            </div>
            <div className="mt-3 bg-yellow-200 rounded-full h-2">
              <div
                className="bg-yellow-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.profileCompleteness}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.totalApplications}</div>
            <div className="text-gray-600 mt-2">Toplam Başvuru</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</div>
            <div className="text-gray-600 mt-2">Beklemede</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">{stats.acceptedApplications}</div>
            <div className="text-gray-600 mt-2">Kabul Edildi</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600">{stats.rejectedApplications}</div>
            <div className="text-gray-600 mt-2">Reddedildi</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/jobs"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-medium">İş Ara</span>
            </Link>
            <Link
              href="/applications"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Başvurularım</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium">Profilim</span>
            </Link>
            <Link
              href="/messages"
              className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">Mesajlar</span>
            </Link>
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Önerilen İş İlanları</h2>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Tümünü Gör →
            </Link>
          </div>
          
          {recommendedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company.companyProfile.companyName}</p>
                    </div>
                    {job.company.companyProfile.logoUrl && (
                      <img
                        src={job.company.companyProfile.logoUrl}
                        alt={job.company.companyProfile.companyName}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span>{job.jobType}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Henüz önerilen iş ilanı bulunmuyor.</p>
              <Link href="/jobs" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                İş ilanlarını keşfet →
              </Link>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Son Aktiviteler</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600">Profilinizi güncellediniz</span>
              <span className="text-gray-400 ml-auto">2 saat önce</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-gray-600">Frontend Developer pozisyonuna başvurdunuz</span>
              <span className="text-gray-400 ml-auto">1 gün önce</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <span className="text-gray-600">TechCorp size mesaj gönderdi</span>
              <span className="text-gray-400 ml-auto">2 gün önce</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
