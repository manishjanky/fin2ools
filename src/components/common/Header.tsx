import { useNavigate } from 'react-router';
import { useState } from 'react';
import Back from './Back';
import Menu from './Menu';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header
        className="border-b backdrop-blur-md sticky top-0 z-50"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border-main)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:opacity-80 transition"
              style={{
                backgroundColor: 'transparent'
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: 'var(--color-primary-main)',
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
                fin2ools
              </h1>
            </button>
            <Menu isMobile={false} />
            {/* Hamburger Menu Button - Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex flex-col gap-1 p-2 rounded-lg transition"
              style={{
                backgroundColor: isMenuOpen ? 'var(--color-bg-secondary)' : 'transparent',
              }}
            >
              <span
                className="w-6 h-0.5 transition-all"
                style={{
                  backgroundColor: 'var(--color-text-primary)',
                  transform: isMenuOpen ? 'rotate(45deg) translateY(8px)' : 'rotate(0)',
                }}
              />
              <span
                className="w-6 h-0.5 transition-all"
                style={{
                  backgroundColor: 'var(--color-text-primary)',
                  opacity: isMenuOpen ? '0' : '1',
                }}
              />
              <span
                className="w-6 h-0.5 transition-all"
                style={{
                  backgroundColor: 'var(--color-text-primary)',
                  transform: isMenuOpen ? 'rotate(-45deg) translateY(-8px)' : 'rotate(0)',
                }}
              />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <Menu isMobile={true} />
          )}
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 pt-2">
        <Back navigate={navigate} />
      </div>
    </>
  );
}
