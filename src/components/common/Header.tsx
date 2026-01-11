import { useNavigate } from 'react-router';
import Back from './Back';

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      <header
        className="border-b backdrop-blur-md sticky top-0 z-50"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border-main)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary-main), var(--color-secondary-main))',
                }}
              >
                <span
                  className="font-bold text-2xl"
                  style={{ color: 'var(--color-text-inverse)' }}
                >
                  ₹
                </span>
              </div>
              <h1
                className="text-lg font-bold"
                style={{ color: 'var(--color-text-primary)' }}
              >
                fin-tools
              </h1>
            </button>

            <nav className="hidden md:flex space-x-8">
              <a
                href="#contact"
                className="transition"
                style={{
                  color: 'var(--color-text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                Contact
              </a>
            </nav>

            <div className="flex items-center gap-4">
              {/* Theme Toggle Removed - Using CSS prefers-color-scheme */}
              <button
                className="md:hidden p-2 rounded-lg transition"
                style={{
                  color: 'var(--color-primary-main)',
                  backgroundColor: 'var(--color-bg-secondary)',
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <Back navigate={navigate} />
      </div>
    </>
  );
}
