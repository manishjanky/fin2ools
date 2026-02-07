import { useNavigate, Link } from 'react-router';
import { useState } from 'react';
import Back from './Back';
import Menu from './Menu';

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="border-b border-border-main bg-bg-primary backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition bg-transparent">
              <img src="/logo.svg" className="min-h-12" />
            </Link>
            <Menu isMobile={false} />
            {/* Hamburger Menu Button - Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden flex flex-col gap-1 p-2 rounded-lg transition ${isMenuOpen ? 'bg-bg-secondary' : 'bg-transparent'
                }`}
            >
              <span
                className="w-6 h-0.5 transition-all bg-text-primary"
                style={{
                  transform: isMenuOpen ? 'rotate(45deg) translateY(8px)' : 'rotate(0)',
                }}
              />
              <span
                className="w-6 h-0.5 transition-all bg-text-primary"
                style={{
                  opacity: isMenuOpen ? '0' : '1',
                }}
              />
              <span
                className="w-6 h-0.5 transition-all bg-text-primary"
                style={{
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
