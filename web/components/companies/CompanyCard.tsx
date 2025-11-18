import Link from 'next/link';

interface CompanyCardProps {
  company: {
    id: string | number;
    company_name?: string;
    sector?: string;
    logo_url?: string;
    verified?: boolean;
    companyProfile?: {
      companyName: string;
      sector: string;
      logoUrl?: string;
      city?: string;
      employeeCount?: string;
    };
  };
}

export function CompanyCard({ company }: CompanyCardProps) {
  // Support both API formats
  const companyName = company.companyProfile?.companyName || company.company_name || 'Şirket';
  const sector = company.companyProfile?.sector || company.sector || 'Sektör';
  const logoUrl = company.companyProfile?.logoUrl || company.logo_url;
  const city = company.companyProfile?.city;
  const employeeCount = company.companyProfile?.employeeCount;

  return (
    <Link href={`/companies/${company.id}`}>
      <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer text-center">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={companyName}
            className="w-20 h-20 mx-auto rounded-lg object-cover mb-4"
          />
        ) : (
          <div className="w-20 h-20 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">
              {companyName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">
            {companyName}
          </h3>
          {company.verified && (
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          {sector}
        </p>
        
        {city && (
          <p className="text-xs text-gray-500">
            {city}
          </p>
        )}
        
        {employeeCount && (
          <p className="text-xs text-gray-500 mt-1">
            {employeeCount} çalışan
          </p>
        )}
      </div>
    </Link>
  );
}
