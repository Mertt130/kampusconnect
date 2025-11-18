'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

interface Job {
  id: string;
  title: string;
  description: string;
  company: {
    id: string;
    companyProfile: {
      companyName: string;
      logoUrl?: string;
      sector: string;
      city: string;
    };
  };
  location: string;
  city?: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote: boolean;
  createdAt: string;
  applicationDeadline?: string;
  _count?: {
    applications: number;
  };
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    isRemote: false,
    sector: '',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: searchTerm,
        ...filters,
      };
      
      const response = await api.getJobs(params);
      if (response.success) {
        setJobs(response.data);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Jobs fetch error:', error);
      // Use sample data if API fails
      setJobs(getSampleJobs());
    } finally {
      setLoading(false);
    }
  };

  const getSampleJobs = (): Job[] => {
    return [
      {
        id: '1',
        title: 'Frontend Developer',
        description: 'React ve Next.js deneyimi olan frontend developer arıyoruz.',
        company: {
          id: '1',
          companyProfile: {
            companyName: 'TechCorp',
            sector: 'Teknoloji',
            city: 'İstanbul',
            logoUrl: 'https://via.placeholder.com/100',
          },
        },
        location: 'İstanbul',
        city: 'İstanbul',
        jobType: 'FULL_TIME',
        salaryMin: 25000,
        salaryMax: 40000,
        isRemote: true,
        createdAt: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { applications: 45 },
      },
      {
        id: '2',
        title: 'Backend Developer',
        description: 'Node.js ve PostgreSQL deneyimi olan backend developer arıyoruz.',
        company: {
          id: '2',
          companyProfile: {
            companyName: 'DataSoft',
            sector: 'Yazılım',
            city: 'Ankara',
            logoUrl: 'https://via.placeholder.com/100',
          },
        },
        location: 'Ankara',
        city: 'Ankara',
        jobType: 'FULL_TIME',
        salaryMin: 30000,
        salaryMax: 45000,
        isRemote: false,
        createdAt: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { applications: 32 },
      },
      {
        id: '3',
        title: 'UI/UX Designer',
        description: 'Figma ve Adobe XD deneyimi olan tasarımcı arıyoruz.',
        company: {
          id: '3',
          companyProfile: {
            companyName: 'DesignHub',
            sector: 'Tasarım',
            city: 'İzmir',
            logoUrl: 'https://via.placeholder.com/100',
          },
        },
        location: 'İzmir',
        city: 'İzmir',
        jobType: 'PART_TIME',
        salaryMin: 15000,
        salaryMax: 25000,
        isRemote: true,
        createdAt: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { applications: 28 },
      },
      {
        id: '4',
        title: 'Mobile Developer',
        description: 'React Native deneyimi olan mobil uygulama geliştiricisi arıyoruz.',
        company: {
          id: '4',
          companyProfile: {
            companyName: 'AppWorks',
            sector: 'Mobil',
            city: 'İstanbul',
            logoUrl: 'https://via.placeholder.com/100',
          },
        },
        location: 'İstanbul',
        city: 'İstanbul',
        jobType: 'FULL_TIME',
        salaryMin: 28000,
        salaryMax: 42000,
        isRemote: false,
        createdAt: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { applications: 51 },
      },
      {
        id: '5',
        title: 'DevOps Engineer',
        description: 'AWS ve Docker deneyimi olan DevOps mühendisi arıyoruz.',
        company: {
          id: '5',
          companyProfile: {
            companyName: 'CloudTech',
            sector: 'Cloud',
            city: 'Ankara',
            logoUrl: 'https://via.placeholder.com/100',
          },
        },
        location: 'Ankara',
        city: 'Ankara',
        jobType: 'FULL_TIME',
        salaryMin: 35000,
        salaryMax: 50000,
        isRemote: true,
        createdAt: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { applications: 23 },
      },
      {
        id: '6',
        title: 'Data Scientist',
        description: 'Python ve Machine Learning deneyimi olan veri bilimci arıyoruz.',
        company: {
          id: '6',
          companyProfile: {
            companyName: 'DataLab',
            sector: 'Veri',
            city: 'İstanbul',
            logoUrl: 'https://via.placeholder.com/100',
          },
        },
        location: 'İstanbul',
        city: 'İstanbul',
        jobType: 'FULL_TIME',
        salaryMin: 40000,
        salaryMax: 60000,
        isRemote: false,
        createdAt: new Date().toISOString(),
        applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
        _count: { applications: 67 },
      },
    ];
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const toggleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
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

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Pozisyon, şirket veya anahtar kelime ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Ara
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm İş Tipleri</option>
                  <option value="FULL_TIME">Tam Zamanlı</option>
                  <option value="PART_TIME">Yarı Zamanlı</option>
                  <option value="INTERNSHIP">Staj</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
                
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Lokasyonlar</option>
                  <option value="İstanbul">İstanbul</option>
                  <option value="Ankara">Ankara</option>
                  <option value="İzmir">İzmir</option>
                  <option value="Bursa">Bursa</option>
                  <option value="Antalya">Antalya</option>
                </select>
                
                <select
                  value={filters.sector}
                  onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tüm Sektörler</option>
                  <option value="Teknoloji">Teknoloji</option>
                  <option value="Yazılım">Yazılım</option>
                  <option value="E-ticaret">E-ticaret</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Eğitim">Eğitim</option>
                </select>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isRemote}
                    onChange={(e) => setFilters({ ...filters, isRemote: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>Uzaktan Çalışma</span>
                </label>
              </div>
            </form>
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {loading ? 'Yükleniyor...' : `${jobs.length} iş ilanı bulundu`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Job Listings */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">İş ilanları yükleniyor...</div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">İlan bulunamadı</h3>
              <p className="text-gray-600">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'p-6' : 'p-5'
                  }`}
                >
                  <div className={viewMode === 'list' ? 'flex gap-6' : ''}>
                    {/* Company Logo */}
                    <div className={viewMode === 'list' ? 'flex-shrink-0' : 'flex items-start justify-between mb-4'}>
                      {viewMode === 'grid' ? (
                        <>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
                                {job.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600">{job.company.companyProfile.companyName}</p>
                          </div>
                          {job.company.companyProfile.logoUrl && (
                            <img
                              src={job.company.companyProfile.logoUrl}
                              alt={job.company.companyProfile.companyName}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                        </>
                      ) : (
                        job.company.companyProfile.logoUrl && (
                          <img
                            src={job.company.companyProfile.logoUrl}
                            alt={job.company.companyProfile.companyName}
                            className="w-16 h-16 rounded object-cover"
                          />
                        )
                      )}
                    </div>

                    {/* Job Details */}
                    <div className="flex-1">
                      {viewMode === 'list' && (
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            <Link href={`/jobs/${job.id}`} className="hover:text-blue-600">
                              {job.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600">{job.company.companyProfile.companyName}</p>
                        </div>
                      )}

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {getJobTypeLabel(job.jobType)}
                        </span>
                        {job.isRemote && (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Uzaktan
                          </span>
                        )}
                      </div>

                      {job.salaryMin && job.salaryMax && (
                        <p className="text-sm font-medium text-green-600 mb-3">
                          {job.salaryMin.toLocaleString('tr-TR')} - {job.salaryMax.toLocaleString('tr-TR')} ₺
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{new Date(job.createdAt).toLocaleDateString('tr-TR')}</span>
                          {job._count && (
                            <span>{job._count.applications} başvuru</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            className={`p-2 rounded-lg transition ${
                              savedJobs.includes(job.id)
                                ? 'bg-red-50 text-red-600'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            <svg className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            Detaylar
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Önceki
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 border rounded-lg ${
                    page === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sonraki
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
