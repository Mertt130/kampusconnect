'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

interface Application {
  id: string;
  job: {
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
  };
  status: 'PENDING' | 'REVIEWING' | 'ACCEPTED' | 'REJECTED';
  coverLetter?: string;
  expectedSalary?: number;
  availableDate?: string;
  appliedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response: any = await api.getMyApplications();
      if (response?.success) {
        setApplications(response.data);
      } else {
        // Use sample data if API fails
        setApplications(getSampleApplications());
      }
    } catch (error) {
      console.error('Applications fetch error:', error);
      setApplications(getSampleApplications());
    } finally {
      setLoading(false);
    }
  };

  const getSampleApplications = (): Application[] => {
    return [
      {
        id: '1',
        job: {
          id: '1',
          title: 'Frontend Developer',
          company: {
            companyProfile: {
              companyName: 'TechCorp',
              logoUrl: 'https://via.placeholder.com/100',
            },
          },
          location: 'İstanbul',
          jobType: 'FULL_TIME',
        },
        status: 'PENDING',
        coverLetter: 'Bu pozisyon için çok heyecanlıyım...',
        expectedSalary: 30000,
        availableDate: '2024-02-01',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        job: {
          id: '2',
          title: 'Backend Developer',
          company: {
            companyProfile: {
              companyName: 'DataSoft',
              logoUrl: 'https://via.placeholder.com/100',
            },
          },
          location: 'Ankara',
          jobType: 'FULL_TIME',
        },
        status: 'REVIEWING',
        coverLetter: 'Node.js konusunda deneyimliyim...',
        expectedSalary: 35000,
        availableDate: '2024-02-15',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        job: {
          id: '3',
          title: 'UI/UX Designer',
          company: {
            companyProfile: {
              companyName: 'DesignHub',
              logoUrl: 'https://via.placeholder.com/100',
            },
          },
          location: 'İzmir',
          jobType: 'PART_TIME',
        },
        status: 'ACCEPTED',
        coverLetter: 'Tasarım tutkum var...',
        expectedSalary: 25000,
        availableDate: '2024-01-20',
        appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        job: {
          id: '4',
          title: 'Mobile Developer',
          company: {
            companyProfile: {
              companyName: 'AppWorks',
              logoUrl: 'https://via.placeholder.com/100',
            },
          },
          location: 'İstanbul',
          jobType: 'FULL_TIME',
        },
        status: 'REJECTED',
        coverLetter: 'React Native deneyimim var...',
        expectedSalary: 32000,
        availableDate: '2024-02-10',
        appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        rejectionReason: 'Maalesef bu pozisyon için daha deneyimli adaylarla devam ediyoruz.',
      },
    ];
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return app.status === 'PENDING' || app.status === 'REVIEWING';
    if (activeTab === 'accepted') return app.status === 'ACCEPTED';
    if (activeTab === 'rejected') return app.status === 'REJECTED';
    return true;
  });

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Başvurunuzu geri çekmek istediğinizden emin misiniz?')) return;

    try {
      await api.withdrawApplication(applicationId);
      toast.success('Başvuru geri çekildi');
      fetchApplications();
    } catch (error) {
      toast.error('Başvuru geri çekilemedi');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Beklemede' },
      REVIEWING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'İnceleniyor' },
      ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Kabul Edildi' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Reddedildi' },
    };
    return badges[status as keyof typeof badges] || badges.PENDING;
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-2">Başvurularım</h1>
          <p className="text-gray-600">Tüm iş başvurularınızı buradan takip edebilirsiniz</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
            <div className="text-sm text-gray-600">Toplam Başvuru</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING').length}
            </div>
            <div className="text-sm text-gray-600">Beklemede</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'ACCEPTED').length}
            </div>
            <div className="text-sm text-gray-600">Kabul Edildi</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-600">Reddedildi</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-6 py-3 text-center font-medium transition ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tümü ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 px-6 py-3 text-center font-medium transition ${
                activeTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Beklemede ({applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING').length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`flex-1 px-6 py-3 text-center font-medium transition ${
                activeTab === 'accepted'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kabul ({applications.filter(a => a.status === 'ACCEPTED').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex-1 px-6 py-3 text-center font-medium transition ${
                activeTab === 'rejected'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Red ({applications.filter(a => a.status === 'REJECTED').length})
            </button>
          </div>

          {/* Applications List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Başvuru bulunamadı</h3>
                <p className="text-gray-600 mb-4">
                  {activeTab === 'all' 
                    ? 'Henüz hiç başvuru yapmadınız'
                    : `${activeTab === 'pending' ? 'Bekleyen' : activeTab === 'accepted' ? 'Kabul edilen' : 'Reddedilen'} başvurunuz bulunmuyor`}
                </p>
                <Link
                  href="/jobs"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  İş İlanlarını Keşfet
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => {
                  const statusBadge = getStatusBadge(application.status);
                  return (
                    <div
                      key={application.id}
                      className="border rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {application.job.company.companyProfile.logoUrl && (
                            <img
                              src={application.job.company.companyProfile.logoUrl}
                              alt={application.job.company.companyProfile.companyName}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              <Link href={`/jobs/${application.job.id}`} className="hover:text-blue-600">
                                {application.job.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600">{application.job.company.companyProfile.companyName}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {application.job.location}
                              </span>
                              <span>{getJobTypeLabel(application.job.jobType)}</span>
                              <span>Başvuru: {new Date(application.appliedAt).toLocaleDateString('tr-TR')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {statusBadge.label}
                          </span>
                          {application.reviewedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              İnceleme: {new Date(application.reviewedAt).toLocaleDateString('tr-TR')}
                            </p>
                          )}
                        </div>
                      </div>

                      {application.status === 'REJECTED' && application.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Red Sebebi:</strong> {application.rejectionReason}
                          </p>
                        </div>
                      )}

                      {application.status === 'ACCEPTED' && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            <strong>Tebrikler!</strong> Başvurunuz kabul edildi. Şirket sizinle iletişime geçecektir.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDetailModal(true);
                          }}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                        >
                          Detayları Gör
                        </button>
                        {(application.status === 'PENDING' || application.status === 'REVIEWING') && (
                          <button
                            onClick={() => handleWithdraw(application.id)}
                            className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm"
                          >
                            Başvuruyu Geri Çek
                          </button>
                        )}
                        <Link
                          href={`/jobs/${application.job.id}`}
                          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm"
                        >
                          İlanı Gör
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Başvuru Detayları</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{selectedApplication.job.title}</h3>
                <p className="text-gray-600">{selectedApplication.job.company.companyProfile.companyName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Başvuru Tarihi:</span>
                  <p className="font-medium">{new Date(selectedApplication.appliedAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Durum:</span>
                  <p className="font-medium">{getStatusBadge(selectedApplication.status).label}</p>
                </div>
                {selectedApplication.expectedSalary && (
                  <div>
                    <span className="text-gray-500">Beklenen Maaş:</span>
                    <p className="font-medium">{selectedApplication.expectedSalary.toLocaleString('tr-TR')} ₺</p>
                  </div>
                )}
                {selectedApplication.availableDate && (
                  <div>
                    <span className="text-gray-500">Başlama Tarihi:</span>
                    <p className="font-medium">{new Date(selectedApplication.availableDate).toLocaleDateString('tr-TR')}</p>
                  </div>
                )}
              </div>

              {selectedApplication.coverLetter && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ön Yazı</h4>
                  <p className="text-gray-600 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                    {selectedApplication.coverLetter}
                  </p>
                </div>
              )}

              {selectedApplication.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-1">Red Sebebi</h4>
                  <p className="text-red-700">{selectedApplication.rejectionReason}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
