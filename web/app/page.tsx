import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { JobCard } from '@/components/jobs/JobCard';
import { CompanyCard } from '@/components/companies/CompanyCard';

export default async function HomePage() {
  // Sample featured jobs
  const featuredJobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: { company_name: 'TechCorp A.Ş.', logo_url: null },
      location: 'İstanbul',
      job_type: 'FULL_TIME',
      salary_min: 15000,
      salary_max: 25000,
      is_remote: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Backend Developer',
      company: { company_name: 'FinanceBank', logo_url: null },
      location: 'Ankara',
      job_type: 'FULL_TIME',
      salary_min: 18000,
      salary_max: 30000,
      is_remote: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: { company_name: 'EduTech Solutions', logo_url: null },
      location: 'İzmir',
      job_type: 'PART_TIME',
      salary_min: 10000,
      salary_max: 18000,
      is_remote: true,
      created_at: new Date().toISOString(),
    },
  ];
  
  const featuredCompanies = [
    {
      id: 1,
      company_name: 'TechCorp A.Ş.',
      sector: 'Teknoloji',
      logo_url: null,
      verified: true,
    },
    {
      id: 2,
      company_name: 'FinanceBank',
      sector: 'Finans',
      logo_url: null,
      verified: true,
    },
    {
      id: 3,
      company_name: 'EduTech Solutions',
      sector: 'Eğitim',
      logo_url: null,
      verified: true,
    },
    {
      id: 4,
      company_name: 'HealthPlus Medikal',
      sector: 'Sağlık',
      logo_url: null,
      verified: false,
    },
  ];

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Kariyerine Başla, Hayallerini Gerçekleştir
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Üniversite öğrencileri ve yeni mezunlar için en iyi iş fırsatları burada!
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/jobs" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                İş İlanlarını Keşfet
              </Link>
              <Link href="/register" className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition">
                Hemen Başla
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600 mt-2">Aktif İş İlanı</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="text-gray-600 mt-2">Partner Şirket</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600 mt-2">Kayıtlı Öğrenci</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">5K+</div>
              <div className="text-gray-600 mt-2">Başarılı Eşleşme</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Profil Oluştur</h3>
              <p className="text-gray-600">CV'ni yükle, yeteneklerini ve deneyimlerini ekle</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. İş Ara</h3>
              <p className="text-gray-600">Sana uygun iş ilanlarını filtrele ve keşfet</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Başvur</h3>
              <p className="text-gray-600">Tek tıkla başvur ve sürecini takip et</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Öne Çıkan İş İlanları</h2>
            <Link href="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">
              Tümünü Gör →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.length > 0 ? (
              featuredJobs.map((job: any) => (
                <JobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                Henüz öne çıkan iş ilanı bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Companies - Temporarily Hidden */}
      {/* TODO: Admin will be able to add featured companies from admin panel */}
      {false && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Partner Şirketler</h2>
              <Link href="/companies" className="text-blue-600 hover:text-blue-700 font-medium">
                Tümünü Gör →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCompanies.length > 0 ? (
                featuredCompanies.map((company: any) => (
                  <CompanyCard key={company.id} company={company} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Partner şirketler yükleniyor...
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Kariyerine Bugün Başla!</h2>
          <p className="text-xl mb-8 text-blue-100">
            Binlerce iş fırsatı seni bekliyor. Hemen ücretsiz kayıt ol!
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register?type=student" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
              Öğrenci Olarak Kayıt Ol
            </Link>
            <Link href="/register?type=company" className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-400 transition">
              Şirket Olarak Kayıt Ol
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
