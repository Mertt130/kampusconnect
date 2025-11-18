'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Job {
  id: string;
  title: string;
  location: string;
  jobType: string;
  status: string;
  applications: number;
  views: number;
  createdAt: string;
}

export default function CompanyJobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'COMPANY') {
      router.push('/dashboard');
      return;
    }
    fetchJobs();
  }, [user, router]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Sample data
      setJobs([
        {
          id: '1',
          title: 'Frontend Developer',
          location: 'İstanbul',
          jobType: 'FULL_TIME',
          status: 'ACTIVE',
          applications: 23,
          views: 156,
          createdAt: '2024-03-15',
        },
        {
          id: '2',
          title: 'Backend Developer',
          location: 'Ankara',
          jobType: 'FULL_TIME',
          status: 'ACTIVE',
          applications: 18,
          views: 142,
          createdAt: '2024-03-10',
        },
        {
          id: '3',
          title: 'UI/UX Designer',
          location: 'İzmir',
          jobType: 'PART_TIME',
          status: 'CLOSED',
          applications: 15,
          views: 98,
          createdAt: '2024-02-20',
        },
      ]);
    } catch (error) {
      toast.error('İlanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (jobId: string) => {
    try {
      toast.success('İlan durumu güncellendi');
      fetchJobs();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      toast.success('İlan silindi');
      fetchJobs();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'active') return job.status === 'ACTIVE';
    if (filter === 'closed') return job.status === 'CLOSED';
    return true;
  });

  if (!user || user.role !== 'COMPANY') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
            <p className="text-gray-600 mt-1">Tüm iş ilanlarınızı görüntüleyin ve yönetin</p>
          </div>
          <Link
            href="/company/jobs/new"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ➕ Yeni İlan Ver
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tümü ({jobs.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Aktif ({jobs.filter(j => j.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'closed'
                  ? 'bg-red-100 text-red-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Kapalı ({jobs.filter(j => j.status === 'CLOSED').length})
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">İlanlar yükleniyor...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 mb-4">Henüz ilan bulunmuyor</p>
              <Link
                href="/company/jobs/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                İlk İlanınızı Verin
              </Link>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        job.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {job.status === 'ACTIVE' ? '✓ Aktif' : '✗ Kapalı'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        📍 {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        💼 {job.jobType}
                      </span>
                      <span className="flex items-center gap-1">
                        📋 {job.applications} başvuru
                      </span>
                      <span className="flex items-center gap-1">
                        👁️ {job.views} görüntüleme
                      </span>
                      <span className="flex items-center gap-1">
                        📅 {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/company/jobs/${job.id}/edit`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        ✏️ Düzenle
                      </Link>
                      <Link
                        href={`/company/applications?job=${job.id}`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        📥 Başvuruları Gör ({job.applications})
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(job.id)}
                        className={`px-4 py-2 rounded-lg transition ${
                          job.status === 'ACTIVE'
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {job.status === 'ACTIVE' ? '⏸️ Durdur' : '▶️ Aktif Et'}
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        🗑️ Sil
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
