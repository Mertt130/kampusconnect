'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Log {
  id: number;
  admin_name: string;
  action: string;
  target: string;
  details: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      toast.error('Bu sayfaya erişim yetkiniz yok');
      return;
    }
    fetchLogs();
  }, [user, router]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Sample data
      setLogs([
        {
          id: 1,
          admin_name: 'Super Admin',
          action: 'USER_BANNED',
          target: 'user@example.com',
          details: 'Kullanıcı yasaklandı',
          created_at: '2024-03-22 14:30:00',
        },
        {
          id: 2,
          admin_name: 'Moderator',
          action: 'COMPANY_VERIFIED',
          target: 'TechCorp A.Ş.',
          details: 'Şirket onaylandı',
          created_at: '2024-03-22 13:15:00',
        },
        {
          id: 3,
          admin_name: 'Super Admin',
          action: 'ROLE_CHANGED',
          target: 'moderator@kampusconnect.com',
          details: 'Rol STUDENT -> MODERATOR olarak değiştirildi',
          created_at: '2024-03-22 10:00:00',
        },
        {
          id: 4,
          admin_name: 'Moderator',
          action: 'REPORT_RESOLVED',
          target: 'Report #15',
          details: 'Şikayet çözüldü olarak işaretlendi',
          created_at: '2024-03-21 16:45:00',
        },
      ]);
    } catch (error) {
      toast.error('Loglar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, string> = {
      USER_BANNED: 'bg-red-100 text-red-800',
      USER_UNBANNED: 'bg-green-100 text-green-800',
      COMPANY_VERIFIED: 'bg-blue-100 text-blue-800',
      COMPANY_REJECTED: 'bg-red-100 text-red-800',
      ROLE_CHANGED: 'bg-purple-100 text-purple-800',
      REPORT_RESOLVED: 'bg-green-100 text-green-800',
      REPORT_REJECTED: 'bg-red-100 text-red-800',
      SETTINGS_UPDATED: 'bg-yellow-100 text-yellow-800',
    };
    return badges[action] || 'bg-gray-100 text-gray-800';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      USER_BANNED: 'Kullanıcı Yasaklandı',
      USER_UNBANNED: 'Kullanıcı Aktif Edildi',
      COMPANY_VERIFIED: 'Şirket Onaylandı',
      COMPANY_REJECTED: 'Şirket Reddedildi',
      ROLE_CHANGED: 'Rol Değiştirildi',
      REPORT_RESOLVED: 'Şikayet Çözüldü',
      REPORT_REJECTED: 'Şikayet Reddedildi',
      SETTINGS_UPDATED: 'Ayarlar Güncellendi',
    };
    return labels[action] || action;
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Logları</h1>
            <p className="text-gray-600 mt-1">Tüm admin işlemlerinin kaydı</p>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loglar yükleniyor...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Log bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hedef</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detay</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">#{log.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.admin_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadge(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{log.target}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">Toplam İşlem</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">Bugün</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {logs.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">Bu Hafta</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {logs.filter(l => {
                const logDate = new Date(l.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return logDate >= weekAgo;
              }).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">Bu Ay</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {logs.filter(l => {
                const logDate = new Date(l.created_at);
                return logDate.getMonth() === new Date().getMonth();
              }).length}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
