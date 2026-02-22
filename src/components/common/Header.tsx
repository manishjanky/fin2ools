import { useNavigate, Link } from 'react-router';
import Back from './Back';
import Menu from './Menu';

export default function Header() {
  const navigate = useNavigate();

  return (
    <>
      <header className="border-b border-border-main bg-bg-primary backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition bg-transparent">
              <img src="/logo.svg" className="min-h-12" />
            </Link>
            <Menu />

          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 pt-2 bg-transparent">
        <Back navigate={navigate} />
      </div>
    </>
  );
}
