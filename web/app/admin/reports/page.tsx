'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Report {
  id: number;
  reporter_name: string;
  reported_user: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

export default function AdminReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR') {
      router.push('/dashboard');
      toast.error('Bu sayfaya erişim yetkiniz yok');
      return;
    }
    fetchReports();
  }, [user, router]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Sample data
      setReports([
        {
          id: 1,
          reporter_name: 'Ahmet Yılmaz',
          reported_user: 'TechCorp A.Ş.',
          reason: 'Yanıltıcı İlan',
          description: 'İlan açıklaması gerçeği yansıtmıyor.',
          status: 'PENDING',
          created_at: '2024-03-20',
        },
        {
          id: 2,
          reporter_name: 'Ayşe Demir',
          reported_user: 'Mehmet Kaya',
          reason: 'Uygunsuz Mesaj',
          description: 'Taciz içerikli mesajlar gönderiyor.',
          status: 'PENDING',
          created_at: '2024-03-21',
        },
        {
          id: 3,
          reporter_name: 'Can Öztürk',
          reported_user: 'XYZ Şirketi',
          reason: 'Spam',
          description: 'Sürekli gereksiz mesaj atıyor.',
          status: 'RESOLVED',
          created_at: '2024-03-15',
        },
      ]);
    } catch (error) {
      toast.error('Şikayetler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: number, newStatus: string) => {
    try {
      // API call would go here
      toast.success('Şikayet durumu güncellendi');
      fetchReports();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'pending') return r.status === 'PENDING';
    if (filter === 'resolved') return r.status === 'RESOLVED';
    if (filter === 'rejected') return r.status === 'REJECTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Bekliyor',
      RESOLVED: 'Çözüldü',
      REJECTED: 'Reddedildi',
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Şikayet Yönetimi</h1>
            <p className="text-gray-600 mt-1">Kullanıcı şikayetlerini incele ve çöz</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Bekleyenler ({reports.filter(r => r.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'resolved'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Çözülenler ({reports.filter(r => r.status === 'RESOLVED').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Reddedilenler ({reports.filter(r => r.status === 'REJECTED').length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tümü ({reports.length})
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Şikayetler yükleniyor...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              Şikayet bulunamadı
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">#{report.id} - {report.reason}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(report.status)}`}>
                        {getStatusLabel(report.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>👤 Şikayet Eden: <span className="font-medium">{report.reporter_name}</span></p>
                      <p>⚠️ Şikayet Edilen: <span className="font-medium">{report.reported_user}</span></p>
                      <p>📅 Tarih: {new Date(report.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">{report.description}</p>
                </div>

                {report.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'RESOLVED')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      ✓ Çözüldü Olarak İşaretle
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'REJECTED')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      ✗ Reddet
                    </button>
                    <button
                      onClick={() => {
                        toast('Kullanıcı detay sayfası açılacak', { icon: 'ℹ️' });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      👁️ Detayları Görüntüle
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
