import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();
  const isActive = (path) => router.pathname === path;

  return (
    <header className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              AyurBase
            </Link>
            <nav className="ml-10 space-x-1">
              {[
                { href: '/doctors', label: 'Doctors' },
                { href: '/book', label: 'Book' },
                { href: '/appointments', label: 'Appointments' },
                { href: '/prescriptions', label: 'Prescriptions' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(href)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">DU</span>
              </div>
              <span className="text-sm text-gray-600 font-medium">Demo User</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
