import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">KampüsConnect</h3>
            <p className="text-gray-400">
              Üniversite öğrencileri ve yeni mezunları işverenlerle buluşturan kariyer platformu.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-white">
                  İş İlanları
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-gray-400 hover:text-white">
                  Şirketler
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* For Students */}
          <div>
            <h4 className="font-semibold mb-4">Öğrenciler İçin</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register?type=student" className="text-gray-400 hover:text-white">
                  Kayıt Ol
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white">
                  Profil Oluştur
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-white">
                  İş Ara
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-white">
                  Kariyer Kaynakları
                </Link>
              </li>
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h4 className="font-semibold mb-4">Şirketler İçin</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/register?type=company" className="text-gray-400 hover:text-white">
                  Şirket Kayıt
                </Link>
              </li>
              <li>
                <Link href="/post-job" className="text-gray-400 hover:text-white">
                  İlan Ver
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white">
                  Paketler
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 KampüsConnect. Tüm hakları saklıdır.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
              Gizlilik Politikası
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
