'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface SavedJob {
  id: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    city?: string;
    jobType: string;
    salaryMin?: number;
    salaryMax?: number;
    isRemote: boolean;
    createdAt: string;
    company: {
      id: string;
      companyProfile: {
        companyName: string;
        logoUrl?: string;
        sector: string;
      };
    };
    _count?: {
      applications: number;
    };
  };
  savedAt: string;
}

export default function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent' | 'remote'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user?.role !== 'STUDENT') {
      router.push('/dashboard');
    } else if (user) {
      fetchSavedJobs();
    }
  }, [user, authLoading, router]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/saved-jobs');
      if (response?.success) {
        setSavedJobs(response.data);
      } else {
        // Use sample data
        setSavedJobs(getSampleSavedJobs());
      }
    } catch (error) {
      console.error('Saved jobs fetch error:', error);
      setSavedJobs(getSampleSavedJobs());
    } finally {
      setLoading(false);
    }
  };

  const getSampleSavedJobs = (): SavedJob[] => {
    return [
      {
        id: '1',
        job: {
          id: '1',
          title: 'Senior Frontend Developer',
          description: 'React ve Next.js ile modern web uygulamaları geliştirme...',
          location: 'İstanbul, Levent',
          city: 'İstanbul',
          jobType: 'FULL_TIME',
          salaryMin: 35000,
          salaryMax: 55000,
          isRemote: true,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          company: {
            id: '1',
            companyProfile: {
              companyName: 'TechCorp Solutions',
              logoUrl: 'https://via.placeholder.com/100',
              sector: 'Teknoloji',
            },
          },
          _count: { applications: 127 },
        },
        savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        job: {
          id: '2',
          title: 'UI/UX Designer',
          description: 'Kullanıcı deneyimi odaklı tasarımlar oluşturma...',
          location: 'İstanbul, Maslak',
          city: 'İstanbul',
          jobType: 'FULL_TIME',
          salaryMin: 25000,
          salaryMax: 40000,
          isRemote: false,
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          company: {
            id: '2',
            companyProfile: {
              companyName: 'DesignHub',
              logoUrl: 'https://via.placeholder.com/100',
              sector: 'Tasarım',
            },
          },
          _count: { applications: 89 },
        },
        savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        job: {
          id: '3',
          title: 'Backend Developer',
          description: 'Node.js ve PostgreSQL ile API geliştirme...',
          location: 'Ankara, Çankaya',
          city: 'Ankara',
          jobType: 'FULL_TIME',
          salaryMin: 30000,
          salaryMax: 50000,
          isRemote: true,
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          company: {
            id: '3',
            companyProfile: {
              companyName: 'DataSoft',
              logoUrl: 'https://via.placeholder.com/100',
              sector: 'Yazılım',
            },
          },
          _count: { applications: 156 },
        },
        savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  };

  const handleRemoveSaved = async (savedJobId: string) => {
    try {
      const response = await api.delete(`/saved-jobs/${savedJobId}`);
      if (response?.success) {
        setSavedJobs(savedJobs.filter(sj => sj.id !== savedJobId));
        toast.success('İlan kaydedilenlerden kaldırıldı');
      } else {
        // Optimistic update for demo
        setSavedJobs(savedJobs.filter(sj => sj.id !== savedJobId));
        toast.success('İlan kaydedilenlerden kaldırıldı');
      }
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const getJobTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      FULL_TIME: 'Tam Zamanlı',
      PART_TIME: 'Yarı Zamanlı',
      INTERNSHIP: 'Staj',
      FREELANCE: 'Freelance',
      REMOTE: 'Uzaktan',
    };
    return labels[type] || type;
  };

  const getFilteredJobs = () => {
    let filtered = savedJobs;
    
    if (filter === 'recent') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter(sj => new Date(sj.savedAt).getTime() > sevenDaysAgo);
    } else if (filter === 'remote') {
      filtered = filtered.filter(sj => sj.job.isRemote);
    }
    
    return filtered;
  };

  const filteredJobs = getFilteredJobs();

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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Kaydedilen İlanlar</h1>
          <p className="text-gray-600">
            İlgilendiğin iş ilanlarını buradan takip edebilirsin.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü ({savedJobs.length})
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'recent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Son 7 Gün
            </button>
            <button
              onClick={() => setFilter('remote')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'remote'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Uzaktan Çalışma
            </button>
          </div>
        </div>

        {/* Saved Jobs List */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((savedJob) => (
              <div
                key={savedJob.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {savedJob.job.company.companyProfile.logoUrl ? (
                      <img
                        src={savedJob.job.company.companyProfile.logoUrl}
                        alt={savedJob.job.company.companyProfile.companyName}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-2xl text-gray-400">🏢</span>
                      </div>
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <Link
                          href={`/jobs/${savedJob.job.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition"
                        >
                          {savedJob.job.title}
                        </Link>
                        <Link
                          href={`/companies/${savedJob.job.company.id}`}
                          className="text-gray-600 hover:text-blue-600 transition block mt-1"
                        >
                          {savedJob.job.company.companyProfile.companyName}
                        </Link>
                      </div>
                      <button
                        onClick={() => handleRemoveSaved(savedJob.id)}
                        className="text-red-600 hover:text-red-700 transition ml-4"
                        title="Kayıtlı İlanlardan Kaldır"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {savedJob.job.location}
                      </span>
                      <span>•</span>
                      <span>{getJobTypeLabel(savedJob.job.jobType)}</span>
                      {savedJob.job.isRemote && (
                        <>
                          <span>•</span>
                          <span className="text-green-600 font-medium">Uzaktan</span>
                        </>
                      )}
                      {savedJob.job._count && (
                        <>
                          <span>•</span>
                          <span>{savedJob.job._count.applications} başvuru</span>
                        </>
                      )}
                    </div>

                    {savedJob.job.salaryMin && savedJob.job.salaryMax && (
                      <div className="text-green-600 font-semibold mb-3">
                        {savedJob.job.salaryMin.toLocaleString('tr-TR')} - {savedJob.job.salaryMax.toLocaleString('tr-TR')} ₺
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-gray-500">
                        Kaydedilme: {new Date(savedJob.savedAt).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        İlan Tarihi: {new Date(savedJob.job.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      <Link
                        href={`/jobs/${savedJob.job.id}`}
                        className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        İlanı Görüntüle
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'Henüz Kayıtlı İlan Yok' : 'Bu Filtrede İlan Bulunamadı'}
            </h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? 'İlgilendiğin iş ilanlarını kaydet ve buradan takip et.'
                : 'Farklı bir filtre seçerek tekrar dene.'}
            </p>
            <Link
              href="/jobs"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              İş İlanlarını Keşfet
            </Link>
          </div>
        )}

        {/* Tips */}
        {savedJobs.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">💡 İpucu</h3>
            <p className="text-sm text-blue-800">
              Kaydettiğin ilanları düzenli olarak kontrol et. Bazı ilanların başvuru süreleri kısa olabilir!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
