'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Company {
  id: number;
  company_name: string;
  sector: string;
  company_size: string;
  website: string | null;
  description: string | null;
  logo_url: string | null;
  verified: boolean;
  _count?: {
    jobs: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  const sectors = [
    'Teknoloji',
    'Finans',
    'Eğitim',
    'Sağlık',
    'Perakende',
    'İmalat',
    'Hizmet',
    'Diğer'
  ];

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '500+'
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/companies');
      setCompanies(response.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Sample data fallback
      setCompanies([
        {
          id: 1,
          company_name: 'TechCorp A.Ş.',
          sector: 'Teknoloji',
          company_size: '201-500',
          website: 'https://techcorp.com',
          description: 'Türkiye\'nin önde gelen yazılım şirketlerinden biri. Mobil ve web uygulamaları geliştiriyoruz.',
          logo_url: null,
          verified: true,
          _count: { jobs: 15 }
        },
        {
          id: 2,
          company_name: 'FinanceBank',
          sector: 'Finans',
          company_size: '500+',
          website: 'https://financebank.com',
          description: 'Dijital bankacılık çözümleri sunan modern banka.',
          logo_url: null,
          verified: true,
          _count: { jobs: 8 }
        },
        {
          id: 3,
          company_name: 'EduTech Solutions',
          sector: 'Eğitim',
          company_size: '51-200',
          website: 'https://edutech.com',
          description: 'Online eğitim platformları ve öğrenme yönetim sistemleri geliştiriyoruz.',
          logo_url: null,
          verified: true,
          _count: { jobs: 12 }
        },
        {
          id: 4,
          company_name: 'HealthPlus Medikal',
          sector: 'Sağlık',
          company_size: '201-500',
          website: 'https://healthplus.com',
          description: 'Sağlık teknolojileri ve medikal yazılımlar.',
          logo_url: null,
          verified: false,
          _count: { jobs: 5 }
        },
        {
          id: 5,
          company_name: 'RetailMax',
          sector: 'Perakende',
          company_size: '500+',
          website: 'https://retailmax.com',
          description: 'E-ticaret ve perakende çözümleri.',
          logo_url: null,
          verified: true,
          _count: { jobs: 20 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || company.sector === selectedSector;
    const matchesSize = !selectedSize || company.company_size === selectedSize;
    
    return matchesSearch && matchesSector && matchesSize;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              KampüsConnect
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600">Ana Sayfa</Link>
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600">İş İlanları</Link>
              <Link href="/companies" className="text-blue-600 font-medium">Şirketler</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">Hakkımızda</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">İletişim</Link>
            </nav>
            <div className="flex gap-3">
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Giriş Yap
              </Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Şirketleri Keşfet
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Türkiye'nin önde gelen şirketleri ile tanış, kariyer fırsatlarını yakala
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Şirket ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Ara
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sektör</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Sektörler</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Büyüklüğü</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Büyüklükler</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size} çalışan</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedSector('');
                  setSelectedSize('');
                  setSearchTerm('');
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredCompanies.length} Şirket Bulundu
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Şirketler yükleniyor...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Şirket bulunamadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                      {company.company_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {company.company_name}
                        </h3>
                        {company.verified && (
                          <span className="text-blue-600" title="Onaylı Şirket">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{company.sector}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {company.description || 'Şirket açıklaması bulunmamaktadır.'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{company.company_size} çalışan</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{company._count?.jobs || 0} açık pozisyon</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/jobs?company=${company.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      İlanları Gör
                    </Link>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        title="Web Sitesi"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
