'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  studentName: string;
  jobTitle: string;
  status: string;
  appliedAt: string;
  email: string;
  phone: string;
}

export default function CompanyApplicationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
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
    fetchApplications();
  }, [user, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Sample data
      setApplications([
        {
          id: '1',
          studentName: 'Ahmet Yılmaz',
          jobTitle: 'Frontend Developer',
          status: 'PENDING',
          appliedAt: '2024-03-20',
          email: 'ahmet@example.com',
          phone: '0555 123 45 67',
        },
        {
          id: '2',
          studentName: 'Ayşe Demir',
          jobTitle: 'Backend Developer',
          status: 'PENDING',
          appliedAt: '2024-03-19',
          email: 'ayse@example.com',
          phone: '0555 234 56 78',
        },
        {
          id: '3',
          studentName: 'Mehmet Kaya',
          jobTitle: 'UI/UX Designer',
          status: 'ACCEPTED',
          appliedAt: '2024-03-15',
          email: 'mehmet@example.com',
          phone: '0555 345 67 89',
        },
      ]);
    } catch (error) {
      toast.error('Başvurular yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      toast.success(`Başvuru durumu güncellendi: ${newStatus}`);
      fetchApplications();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'pending') return app.status === 'PENDING';
    if (filter === 'accepted') return app.status === 'ACCEPTED';
    if (filter === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Bekliyor',
      ACCEPTED: 'Kabul Edildi',
      REJECTED: 'Reddedildi',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!user || user.role !== 'COMPANY') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Başvurular</h1>
            <p className="text-gray-600 mt-1">İş ilanlarınıza gelen başvuruları yönetin</p>
          </div>
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
              Tümü ({applications.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Bekleyenler ({applications.filter(a => a.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'accepted'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Kabul Edilenler ({applications.filter(a => a.status === 'ACCEPTED').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Reddedilenler ({applications.filter(a => a.status === 'REJECTED').length})
            </button>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Başvurular yükleniyor...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              Başvuru bulunamadı
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {app.studentName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{app.studentName}</h3>
                      <p className="text-gray-600">{app.jobTitle} pozisyonuna başvurdu</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📧 {app.email}</span>
                        <span>📱 {app.phone}</span>
                        <span>📅 {new Date(app.appliedAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toast('CV görüntüleme özelliği eklenecek')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    📄 CV'yi Görüntüle
                  </button>
                  <button
                    onClick={() => toast('Mesaj gönderme özelliği eklenecek')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    💬 Mesaj Gönder
                  </button>
                  {app.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        ✓ Kabul Et
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        ✗ Reddet
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
