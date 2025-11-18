const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Create Super Admin
  const adminPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!@#', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'admin@kampusconnect.com' },
    update: {},
    create: {
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@kampusconnect.com',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true,
      isActive: true
    }
  });
  
  console.log('✅ Super Admin created:', superAdmin.email);
  
  // Create sample students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash('Student123!', 10);
    const student = await prisma.user.create({
      data: {
        email: `student${i}@example.com`,
        password: hashedPassword,
        role: 'STUDENT',
        isVerified: true,
        isActive: true,
        studentProfile: {
          create: {
            firstName: `Öğrenci`,
            lastName: `${i}`,
            university: ['Boğaziçi Üniversitesi', 'İTÜ', 'ODTÜ', 'Hacettepe', 'Bilkent'][i - 1],
            department: ['Bilgisayar Mühendisliği', 'Yazılım Mühendisliği', 'Endüstri Mühendisliği', 'İşletme', 'Makine Mühendisliği'][i - 1],
            graduationYear: 2024 + (i % 3),
            gpa: 3.0 + (i * 0.15),
            about: `${i}. sınıf öğrencisiyim. Yazılım geliştirme ve teknoloji alanında kariyer yapmak istiyorum.`,
            skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
            languages: ['Türkçe', 'İngilizce'],
            city: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'][i - 1]
          }
        }
      }
    });
    students.push(student);
  }
  
  console.log(`✅ ${students.length} sample students created`);
  
  // Create sample companies
  const companies = [];
  for (let i = 1; i <= 5; i++) {
    const hashedPassword = await bcrypt.hash('Company123!', 10);
    const company = await prisma.user.create({
      data: {
        email: `company${i}@example.com`,
        password: hashedPassword,
        role: 'COMPANY',
        isVerified: true,
        isActive: true,
        companyProfile: {
          create: {
            companyName: ['TechCorp', 'DataSoft', 'CloudWorks', 'AI Solutions', 'DevHub'][i - 1],
            sector: ['Teknoloji', 'Yazılım', 'E-ticaret', 'Fintech', 'SaaS'][i - 1],
            employeeCount: ['10-50', '50-100', '100-500', '500-1000', '1000+'][i - 1],
            foundedYear: 2010 + i,
            description: `Teknoloji alanında öncü firmalardan biriyiz. ${i * 10} yıllık tecrübemizle sektörde lider konumdayız.`,
            website: `https://company${i}.com`,
            city: ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'][i - 1],
            country: 'Türkiye',
            isVerified: true,
            verifiedAt: new Date()
          }
        }
      }
    });
    companies.push(company);
  }
  
  console.log(`✅ ${companies.length} sample companies created`);
  
  // Create sample jobs
  const jobTitles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Mobile Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Product Manager',
    'UI/UX Designer',
    'Business Analyst',
    'Software Tester'
  ];
  
  const jobs = [];
  for (let i = 0; i < 20; i++) {
    const companyIndex = i % companies.length;
    const job = await prisma.job.create({
      data: {
        companyId: companies[companyIndex].id,
        title: jobTitles[i % jobTitles.length],
        description: `${jobTitles[i % jobTitles.length]} pozisyonu için deneyimli veya yeni mezun adaylar arıyoruz. Dinamik ve yenilikçi ekibimizde yer almak ister misiniz?`,
        requirements: [
          'Üniversite mezunu (tercihen ilgili bölümlerden)',
          'İyi derecede İngilizce bilgisi',
          'Takım çalışmasına yatkın',
          'Analitik düşünme yeteneği',
          'Problem çözme becerisi'
        ],
        responsibilities: [
          'Proje geliştirme süreçlerine katılmak',
          'Kod kalitesi ve standartlarına uymak',
          'Teknik dokümantasyon hazırlamak',
          'Takım ile koordineli çalışmak',
          'Yeni teknolojileri takip etmek'
        ],
        qualifications: [
          'İlgili alanda en az 1 yıl deneyim (yeni mezunlar da başvurabilir)',
          'Modern teknolojilere hakim',
          'Versiyon kontrol sistemleri bilgisi',
          'Agile/Scrum metodolojilerine aşinalık'
        ],
        benefits: [
          'Rekabetçi maaş',
          'Performans primi',
          'Özel sağlık sigortası',
          'Yemek kartı',
          'Uzaktan çalışma imkanı',
          'Kariyer gelişim fırsatları'
        ],
        jobType: ['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'REMOTE'][i % 5],
        location: ['İstanbul', 'Ankara', 'İzmir', 'Remote', 'Hybrid'][i % 5],
        city: ['İstanbul', 'Ankara', 'İzmir', null, null][i % 5],
        isRemote: i % 5 >= 3,
        salaryMin: 15000 + (i * 2000),
        salaryMax: 25000 + (i * 3000),
        experienceMin: i % 4,
        experienceMax: (i % 4) + 3,
        educationLevel: 'Lisans',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        isFeatured: i < 5
      }
    });
    jobs.push(job);
  }
  
  console.log(`✅ ${jobs.length} sample jobs created`);
  
  // Create sample applications
  let applicationCount = 0;
  for (const student of students) {
    // Each student applies to 2-3 random jobs
    const numApplications = 2 + Math.floor(Math.random() * 2);
    const appliedJobs = new Set();
    
    for (let i = 0; i < numApplications; i++) {
      let jobIndex;
      do {
        jobIndex = Math.floor(Math.random() * jobs.length);
      } while (appliedJobs.has(jobIndex));
      
      appliedJobs.add(jobIndex);
      
      await prisma.application.create({
        data: {
          jobId: jobs[jobIndex].id,
          studentId: student.id,
          status: ['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'][Math.floor(Math.random() * 4)],
          coverLetter: 'Bu pozisyon için çok heyecanlıyım. Şirketinizin değerlerine ve vizyonuna katkıda bulunmak istiyorum.',
          expectedSalary: 20000 + Math.floor(Math.random() * 10000),
          availableDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        }
      });
      applicationCount++;
    }
  }
  
  console.log(`✅ ${applicationCount} sample applications created`);
  
  // Create sample conversations and messages
  let conversationCount = 0;
  for (let i = 0; i < 3; i++) {
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: students[i].id,
        participant2Id: companies[i].id
      }
    });
    
    // Create sample messages
    for (let j = 0; j < 5; j++) {
      const isFromStudent = j % 2 === 0;
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: isFromStudent ? students[i].id : companies[i].id,
          content: isFromStudent 
            ? `Merhaba, ${jobs[i].title} pozisyonu hakkında bilgi almak istiyorum.`
            : `Merhaba, başvurunuz için teşekkürler. Size yardımcı olabilirim.`,
          isRead: true,
          readAt: new Date()
        }
      });
    }
    conversationCount++;
  }
  
  console.log(`✅ ${conversationCount} sample conversations created`);
  
  // Create site settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'KampüsConnect',
      siteDescription: 'Öğrenciler ve işverenler için kariyer platformu',
      contactEmail: 'info@kampusconnect.com',
      contactPhone: '+90 212 555 0000',
      contactAddress: 'İstanbul, Türkiye',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981'
    }
  });
  
  console.log('✅ Site settings created');
  
  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Super Admin: admin@kampusconnect.com / SuperAdmin123!@#');
  console.log('Sample Student: student1@example.com / Student123!');
  console.log('Sample Company: company1@example.com / Company123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
