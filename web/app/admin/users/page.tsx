'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  student_profile?: {
    first_name: string;
    last_name: string;
  };
  company_profile?: {
    company_name: string;
  };
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Sample data
      setUsers([
        {
          id: 1,
          email: 'student1@example.com',
          role: 'STUDENT',
          is_active: true,
          created_at: '2024-01-15',
          student_profile: { first_name: 'Ahmet', last_name: 'Yılmaz' }
        },
        {
          id: 2,
          email: 'company1@example.com',
          role: 'COMPANY',
          is_active: true,
          created_at: '2024-01-20',
          company_profile: { company_name: 'TechCorp A.Ş.' }
        },
        {
          id: 3,
          email: 'student2@example.com',
          role: 'STUDENT',
          is_active: false,
          created_at: '2024-02-01',
          student_profile: { first_name: 'Ayşe', last_name: 'Demir' }
        },
        {
          id: 4,
          email: 'moderator@kampusconnect.com',
          role: 'MODERATOR',
          is_active: true,
          created_at: '2024-01-10',
        },
      ]);
    } catch (error) {
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number, currentStatus: boolean) => {
    if (!confirm(`Bu kullanıcıyı ${currentStatus ? 'yasaklamak' : 'aktif etmek'} istediğinize emin misiniz?`)) {
      return;
    }

    try {
      // API call would go here
      toast.success(`Kullanıcı ${currentStatus ? 'yasaklandı' : 'aktif edildi'}`);
      fetchUsers();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    if (!confirm(`Bu kullanıcının rolünü ${newRole} olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      // API call would go here
      toast.success('Kullanıcı rolü güncellendi');
      fetchUsers();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    try {
      // API call would go here
      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.student_profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.student_profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.company_profile?.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = !statusFilter || (statusFilter === 'active' ? u.is_active : !u.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    const badges = {
      SUPER_ADMIN: 'bg-red-100 text-red-800',
      MODERATOR: 'bg-purple-100 text-purple-800',
      COMPANY: 'bg-blue-100 text-blue-800',
      STUDENT: 'bg-green-100 text-green-800',
    };
    return badges[role as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      SUPER_ADMIN: 'Süper Admin',
      MODERATOR: 'Moderatör',
      COMPANY: 'Şirket',
      STUDENT: 'Öğrenci',
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="text-gray-600 mt-1">Tüm kullanıcıları görüntüle ve yönet</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Email, isim veya şirket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Roller</option>
                <option value="STUDENT">Öğrenci</option>
                <option value="COMPANY">Şirket</option>
                <option value="MODERATOR">Moderatör</option>
                <option value="SUPER_ADMIN">Süper Admin</option>
              </select>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="banned">Yasaklı</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Kullanıcılar yükleniyor...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Kullanıcı bulunamadı
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">#{u.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {u.student_profile 
                            ? `${u.student_profile.first_name} ${u.student_profile.last_name}`
                            : u.company_profile?.company_name || 'Admin'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {u.is_active ? 'Aktif' : 'Yasaklı'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(u.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleBanUser(u.id, u.is_active)}
                            className={`px-3 py-1 rounded ${
                              u.is_active 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {u.is_active ? 'Yasakla' : 'Aktif Et'}
                          </button>
                          <select
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs"
                            defaultValue=""
                          >
                            <option value="" disabled>Rol Değiştir</option>
                            <option value="STUDENT">Öğrenci</option>
                            <option value="COMPANY">Şirket</option>
                            <option value="MODERATOR">Moderatör</option>
                            <option value="SUPER_ADMIN">Süper Admin</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Sil
                          </button>
                        </div>
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
            <div className="text-sm text-gray-600">Toplam Kullanıcı</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">Öğrenciler</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {users.filter(u => u.role === 'STUDENT').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">Şirketler</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {users.filter(u => u.role === 'COMPANY').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-600">Yasaklı</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {users.filter(u => !u.is_active).length}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
