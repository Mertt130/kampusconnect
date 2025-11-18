'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Company {
  id: number;
  company_name: string;
  email: string;
  sector: string;
  verified: boolean;
  created_at: string;
}

export default function AdminCompaniesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
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
    fetchCompanies();
  }, [user, router]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      // Sample data
      setCompanies([
        {
          id: 1,
          company_name: 'TechCorp A.Ş.',
          email: 'info@techcorp.com',
          sector: 'Teknoloji',
          verified: true,
          created_at: '2024-01-15',
        },
        {
          id: 2,
          company_name: 'NewStartup Ltd.',
          email: 'contact@newstartup.com',
          sector: 'Finans',
          verified: false,
          created_at: '2024-03-20',
        },
        {
          id: 3,
          company_name: 'EduTech Solutions',
          email: 'info@edutech.com',
          sector: 'Eğitim',
          verified: false,
          created_at: '2024-03-22',
        },
      ]);
    } catch (error) {
      toast.error('Şirketler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (companyId: number, verify: boolean) => {
    try {
      // API call would go here
      toast.success(verify ? 'Şirket onaylandı' : 'Şirket onayı kaldırıldı');
      fetchCompanies();
    } catch (error) {
      toast.error('İşlem başarısız oldu');
    }
  };

  const filteredCompanies = companies.filter(c => {
    if (filter === 'pending') return !c.verified;
    if (filter === 'verified') return c.verified;
    return true;
  });

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Şirket Onayları</h1>
            <p className="text-gray-600 mt-1">Bekleyen şirket başvurularını incele ve onayla</p>
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
              Bekleyenler ({companies.filter(c => !c.verified).length})
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'verified'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Onaylananlar ({companies.filter(c => c.verified).length})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Tümü ({companies.length})
            </button>
          </div>
        </div>

        {/* Companies List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Şirketler yükleniyor...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              Şirket bulunamadı
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{company.company_name}</h3>
                      {company.verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          ✓ Onaylı
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📧 {company.email}</p>
                      <p>🏢 {company.sector}</p>
                      <p>📅 Kayıt: {new Date(company.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!company.verified ? (
                      <>
                        <button
                          onClick={() => handleVerify(company.id, true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          ✓ Onayla
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Bu şirketi reddetmek istediğinize emin misiniz?')) {
                              toast.success('Şirket reddedildi');
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                          ✗ Reddet
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleVerify(company.id, false)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                      >
                        Onayı Kaldır
                      </button>
                    )}
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
