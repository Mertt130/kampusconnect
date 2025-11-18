'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface CompanyDetail {
  id: string;
  email: string;
  companyProfile: {
    companyName: string;
    logoUrl?: string;
    sector: string;
    city: string;
    address?: string;
    website?: string;
    description?: string;
    employeeCount?: string;
    foundedYear?: number;
    verified: boolean;
  };
  jobs?: Array<{
    id: string;
    title: string;
    location: string;
    jobType: string;
    createdAt: string;
    isActive: boolean;
    _count?: {
      applications: number;
    };
  }>;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'jobs'>('about');

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetail(params.id as string);
    }
  }, [params.id]);

  const fetchCompanyDetail = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/companies/${companyId}`);
      if (response?.success) {
        setCompany(response.data);
      } else {
        // Use sample data if API fails
        setCompany(getSampleCompanyDetail(companyId));
      }
    } catch (error) {
      console.error('Company detail fetch error:', error);
      setCompany(getSampleCompanyDetail(companyId));
    } finally {
      setLoading(false);
    }
  };

  const getSampleCompanyDetail = (companyId: string): CompanyDetail => {
    return {
      id: companyId,
      email: 'info@techcorp.com',
      companyProfile: {
        companyName: 'TechCorp Solutions',
        logoUrl: 'https://via.placeholder.com/200',
        sector: 'Teknoloji',
        city: 'İstanbul',
        address: 'Levent Mahallesi, Büyükdere Caddesi No:123, Şişli/İstanbul',
        website: 'https://techcorp.com',
        description: `TechCorp Solutions, 2015 yılından beri teknoloji alanında yenilikçi çözümler üreten, Türkiye'nin önde gelen teknoloji şirketlerinden biridir. 

Misyonumuz, dijital dönüşüm sürecinde şirketlere en iyi teknoloji çözümlerini sunmak ve iş süreçlerini optimize etmektir. 500'den fazla çalışanımız ile müşterilerimize web ve mobil uygulama geliştirme, bulut çözümleri, yapay zeka ve veri analitiği alanlarında hizmet vermekteyiz.

Çalışan memnuniyetine önem veren, sürekli gelişimi destekleyen ve yenilikçi bir çalışma ortamı sunuyoruz. Ekibimiz, sektörün en yetenekli profesyonellerinden oluşmakta ve her gün yeni projelerde birlikte çalışmaktayız.`,
        employeeCount: '500-1000',
        foundedYear: 2015,
        verified: true,
      },
      jobs: [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          location: 'İstanbul, Levent',
          jobType: 'FULL_TIME',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          _count: { applications: 127 },
        },
        {
          id: '2',
          title: 'Backend Developer',
          location: 'İstanbul, Levent',
          jobType: 'FULL_TIME',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          _count: { applications: 89 },
        },
        {
          id: '3',
          title: 'UI/UX Designer',
          location: 'İstanbul, Levent',
          jobType: 'FULL_TIME',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          _count: { applications: 156 },
        },
        {
          id: '4',
          title: 'DevOps Engineer',
          location: 'İstanbul, Levent',
          jobType: 'FULL_TIME',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          _count: { applications: 73 },
        },
      ],
    };
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!company) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Şirket bulunamadı</h2>
            <Link href="/companies" className="text-blue-600 hover:text-blue-700">
              Şirketlere dön →
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const activeJobs = company.jobs?.filter(job => job.isActive) || [];

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        {/* Company Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {company.companyProfile.logoUrl && (
                <img
                  src={company.companyProfile.logoUrl}
                  alt={company.companyProfile.companyName}
                  className="w-32 h-32 rounded-lg bg-white p-4 object-contain shadow-lg"
                />
              )}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{company.companyProfile.companyName}</h1>
                  {company.companyProfile.verified && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      ✓ Onaylı
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-lg mb-4">{company.companyProfile.sector}</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{company.companyProfile.city}</span>
                  </div>
                  {company.companyProfile.employeeCount && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{company.companyProfile.employeeCount} çalışan</span>
                    </div>
                  )}
                  {company.companyProfile.foundedYear && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Kuruluş: {company.companyProfile.foundedYear}</span>
                    </div>
                  )}
                  {company.companyProfile.website && (
                    <a
                      href={company.companyProfile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-blue-200 transition"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{activeJobs.length}</div>
                <div className="text-blue-100">Aktif İlan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b sticky top-16 z-10">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === 'about'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Şirket Hakkında
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === 'jobs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                İş İlanları ({activeJobs.length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {activeTab === 'about' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* About Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Şirket Hakkında</h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                  {company.companyProfile.description || 'Şirket açıklaması bulunmamaktadır.'}
                </div>
              </div>

              {/* Contact Info */}
              {company.companyProfile.address && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-4">İletişim Bilgileri</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <div>
                        <div className="font-medium text-gray-900">Adres</div>
                        <div className="text-gray-600">{company.companyProfile.address}</div>
                      </div>
                    </div>
                    {company.companyProfile.website && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-500 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        <div>
                          <div className="font-medium text-gray-900">Website</div>
                          <a
                            href={company.companyProfile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {company.companyProfile.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="max-w-4xl mx-auto">
              {activeJobs.length > 0 ? (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {job.location}
                            </span>
                            <span>•</span>
                            <span>{getJobTypeLabel(job.jobType)}</span>
                            <span>•</span>
                            <span>{new Date(job.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {job._count?.applications || 0} Başvuru
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          İlanı Görüntüle →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aktif İlan Bulunmuyor</h3>
                  <p className="text-gray-600">Bu şirketin şu anda aktif iş ilanı bulunmamaktadır.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
