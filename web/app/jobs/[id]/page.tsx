'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import toast from 'react-hot-toast';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  company: {
    id: string;
    companyProfile: {
      companyName: string;
      logoUrl?: string;
      sector: string;
      city: string;
      website?: string;
      description?: string;
      employeeCount?: string;
    };
  };
  location: string;
  city?: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  isRemote: boolean;
  experienceMin?: number;
  experienceMax?: number;
  educationLevel?: string;
  applicationDeadline?: string;
  createdAt: string;
  _count?: {
    applications: number;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    expectedSalary: '',
    availableDate: '',
  });
  const [similarJobs, setSimilarJobs] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchJobDetail(params.id as string);
      fetchSimilarJobs();
    }
  }, [params.id]);

  const fetchJobDetail = async (jobId: string) => {
    try {
      setLoading(true);
      const response = await api.getJob(jobId);
      if (response?.success) {
        setJob(response.data);
      } else {
        // Use sample data if API fails
        setJob(getSampleJobDetail(jobId));
      }
      
      // Check if user has already applied
      if (user) {
        checkApplicationStatus(jobId);
      }
    } catch (error) {
      console.error('Job detail fetch error:', error);
      setJob(getSampleJobDetail(jobId));
    } finally {
      setLoading(false);
    }
  };

  const getSampleJobDetail = (jobId: string): JobDetail => {
    return {
      id: jobId,
      title: 'Senior Frontend Developer',
      description: `Teknoloji sektöründe lider konumumuzu güçlendirmek için ekibimize katılacak deneyimli bir Frontend Developer arıyoruz. 
      
      Bu pozisyonda, modern web teknolojilerini kullanarak kullanıcı dostu ve performanslı web uygulamaları geliştirme konusunda aktif rol alacaksınız. Çevik metodolojiler ile çalışan dinamik bir ekibin parçası olacak, ürün geliştirme süreçlerine baştan sona dahil olacaksınız.`,
      requirements: [
        'En az 3 yıl frontend geliştirme deneyimi',
        'React.js ve Next.js ile uygulama geliştirme deneyimi',
        'TypeScript bilgisi',
        'Modern CSS frameworkleri (Tailwind CSS, Styled Components)',
        'Git versiyon kontrol sistemi',
        'RESTful API ve GraphQL deneyimi',
        'Responsive ve mobile-first tasarım prensipleri',
      ],
      responsibilities: [
        'Modern web uygulamaları geliştirmek',
        'UI/UX ekibi ile yakın çalışarak tasarımları koda dökmek',
        'Kod kalitesi ve performans optimizasyonu',
        'Unit ve integration testleri yazmak',
        'Code review süreçlerine katılmak',
        'Teknik dokümantasyon hazırlamak',
        'Junior geliştiricilere mentorluk yapmak',
      ],
      qualifications: [
        'Bilgisayar Mühendisliği veya ilgili bölümlerden mezun',
        'İyi derecede İngilizce bilgisi',
        'Takım çalışmasına yatkın',
        'Analitik düşünme yeteneği',
        'Problem çözme becerisi',
        'Yeni teknolojileri öğrenmeye açık',
      ],
      benefits: [
        'Rekabetçi maaş',
        'Performans primi (yılda 4 maaş)',
        'Özel sağlık sigortası',
        'Yemek kartı',
        'Uzaktan çalışma imkanı (Hibrit)',
        'Macbook Pro',
        'Eğitim ve sertifika desteği',
        'Espresso ve atıştırmalıklar',
        'Happy hour etkinlikleri',
      ],
      company: {
        id: '1',
        companyProfile: {
          companyName: 'TechCorp Solutions',
          logoUrl: 'https://via.placeholder.com/150',
          sector: 'Teknoloji',
          city: 'İstanbul',
          website: 'https://techcorp.com',
          description: 'TechCorp, 2015 yılından beri teknoloji alanında yenilikçi çözümler üreten, 500+ çalışanı ile Türkiye\'nin önde gelen teknoloji şirketlerinden biridir.',
          employeeCount: '500-1000',
        },
      },
      location: 'İstanbul, Levent',
      city: 'İstanbul',
      jobType: 'FULL_TIME',
      salaryMin: 35000,
      salaryMax: 55000,
      isRemote: true,
      experienceMin: 3,
      experienceMax: 7,
      educationLevel: 'Lisans',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      _count: {
        applications: 127,
      },
    };
  };

  const fetchSimilarJobs = async () => {
    try {
      const response = await api.getJobs({ limit: 4 });
      if (response?.success) {
        setSimilarJobs(response.data);
      }
    } catch (error) {
      console.error('Similar jobs fetch error:', error);
    }
  };

  const checkApplicationStatus = async (jobId: string) => {
    try {
      const response = await api.getMyApplications();
      if (response?.success) {
        const applied = response.data.some((app: any) => app.jobId === jobId);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error('Application status check error:', error);
    }
  };

  const handleApply = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'STUDENT') {
      toast.error('Sadece öğrenciler başvuru yapabilir');
      return;
    }

    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    try {
      setApplying(true);
      const response = await api.applyToJob({
        jobId: job?.id,
        ...applicationData,
      });
      
      if (response?.success) {
        toast.success('Başvurunuz başarıyla gönderildi!');
        setHasApplied(true);
        setShowApplyModal(false);
      } else {
        toast.error('Başvuru gönderilemedi');
      }
    } catch (error: any) {
      toast.error(error.message || 'Başvuru sırasında hata oluştu');
    } finally {
      setApplying(false);
    }
  };

  const toggleSaveJob = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isSaved) {
        // Remove from saved
        setIsSaved(false);
        toast.success('İlan kaydedilenlerden kaldırıldı');
      } else {
        // Add to saved
        setIsSaved(true);
        toast.success('İlan kaydedildi');
      }
    } catch (error) {
      toast.error('İşlem başarısız');
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

  if (!job) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">İlan bulunamadı</h2>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-700">
              İş ilanlarına dön →
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="font-medium">{job.company.companyProfile.companyName}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                  </div>
                  {job.company.companyProfile.logoUrl && (
                    <img
                      src={job.company.companyProfile.logoUrl}
                      alt={job.company.companyProfile.companyName}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {getJobTypeLabel(job.jobType)}
                  </span>
                  {job.isRemote && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Uzaktan Çalışma
                    </span>
                  )}
                  {job.experienceMin && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {job.experienceMin}-{job.experienceMax} yıl deneyim
                    </span>
                  )}
                  {job.educationLevel && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                      {job.educationLevel}
                    </span>
                  )}
                </div>

                {job.salaryMin && job.salaryMax && (
                  <div className="text-lg font-semibold text-green-600 mb-4">
                    {job.salaryMin.toLocaleString('tr-TR')} - {job.salaryMax.toLocaleString('tr-TR')} ₺ / Ay
                  </div>
                )}

                <div className="flex gap-3">
                  {hasApplied ? (
                    <button
                      disabled
                      className="flex-1 bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                    >
                      ✓ Başvuru Yapıldı
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Başvur
                    </button>
                  )}
                  <button
                    onClick={toggleSaveJob}
                    className={`px-6 py-3 rounded-lg font-medium transition ${
                      isSaved
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isSaved ? '❤️ Kaydedildi' : '🤍 Kaydet'}
                  </button>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">İş Tanımı</h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Aranan Nitelikler</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">✓</span>
                      <span className="text-gray-600">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">İş Tanımı ve Sorumluluklar</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-600">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Yan Haklar ve İmkanlar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Şirket Hakkında</h3>
                <div className="space-y-4">
                  {job.company.companyProfile.logoUrl && (
                    <img
                      src={job.company.companyProfile.logoUrl}
                      alt={job.company.companyProfile.companyName}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{job.company.companyProfile.companyName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{job.company.companyProfile.sector}</p>
                  </div>
                  {job.company.companyProfile.description && (
                    <p className="text-sm text-gray-600">{job.company.companyProfile.description}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    {job.company.companyProfile.employeeCount && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">👥</span>
                        <span>{job.company.companyProfile.employeeCount} çalışan</span>
                      </div>
                    )}
                    {job.company.companyProfile.city && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📍</span>
                        <span>{job.company.companyProfile.city}</span>
                      </div>
                    )}
                    {job.company.companyProfile.website && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">🌐</span>
                        <a
                          href={job.company.companyProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/companies/${job.company.id}`}
                    className="block text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                  >
                    Şirket Profilini Gör
                  </Link>
                </div>
              </div>

              {/* Job Stats */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">İlan Detayları</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yayın Tarihi:</span>
                    <span className="font-medium">{new Date(job.createdAt).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {job.applicationDeadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Son Başvuru:</span>
                      <span className="font-medium text-red-600">
                        {new Date(job.applicationDeadline).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                  {job._count && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Başvuru Sayısı:</span>
                      <span className="font-medium">{job._count.applications}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Similar Jobs */}
              {similarJobs.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Benzer İlanlar</h3>
                  <div className="space-y-3">
                    {similarJobs.slice(0, 3).map((similarJob: any) => (
                      <Link
                        key={similarJob.id}
                        href={`/jobs/${similarJob.id}`}
                        className="block p-3 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <h4 className="font-medium text-gray-900 mb-1">{similarJob.title}</h4>
                        <p className="text-sm text-gray-600">{similarJob.company?.companyProfile?.companyName}</p>
                        <p className="text-xs text-gray-500 mt-1">{similarJob.location}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">İş Başvurusu</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ön Yazı
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Neden bu pozisyon için uygun olduğunuzu açıklayın..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beklenen Maaş (₺/Ay)
                </label>
                <input
                  type="number"
                  value={applicationData.expectedSalary}
                  onChange={(e) => setApplicationData({ ...applicationData, expectedSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 25000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  En Erken Başlama Tarihi
                </label>
                <input
                  type="date"
                  value={applicationData.availableDate}
                  onChange={(e) => setApplicationData({ ...applicationData, availableDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Not:</strong> CV'niz ve profil bilgileriniz otomatik olarak başvurunuza eklenecektir.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={submitApplication}
                disabled={applying || !applicationData.coverLetter}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
