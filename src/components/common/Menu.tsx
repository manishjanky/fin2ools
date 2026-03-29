import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

export default function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const location = useLocation()
    
    useEffect(() => {
        setIsMenuOpen(false);
        setOpenDropdown(null);
    }, [location]);

    const isActive = (path: string) => location.pathname.startsWith(path);
    
    const navLinkClass = `
        transition-all duration-200 py-2 rounded-md text-sm font-medium
        text-text-secondary hover:text-text-primary hover:bg-bg-secondary
    `;

    const mobileNavLinkClass = (path: string) => `
        transition-all duration-200 px-4 py-2.5 rounded-md text-base
        ${isActive(path)
            ? 'text-white font-medium'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
        }
    `;

    const submenuItemClass = (path: string) => `
        transition-all duration-200 px-4 py-2 rounded-md text-sm
        ${isActive(path)
            ? 'text-white font-medium'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
        }
    `;
    
    return (
        <>
            <nav className={
                isMenuOpen 
                    ? "grid grid-cols-1 mt-4 py-4 gap-2 border-t border-border-light absolute px-2 top-0 left-0 w-dvw bg-bg-primary" 
                    : "hidden lg:flex space-x-2 items-center"
            }>
                {/* Deposits Dropdown */}
                <div className="transition-all duration-200 text-text-secondary relative group lg:group-hover:text-text-primary">
                    <button 
                        className={navLinkClass}
                        onClick={() => setOpenDropdown(openDropdown === 'deposits' ? null : 'deposits')}
                    >
                        <span className="flex items-center gap-1.5">
                            Deposits
                            <svg className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'deposits' ? 'rotate-180' : ''} lg:group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </span>
                    </button>
                    
                    {/* Desktop Dropdown */}
                    <div className='hidden lg:grid lg:group-hover:grid grid-cols-1 absolute top-full left-0 bg-bg-primary lg:border lg:border-border-main rounded-lg lg:shadow-lg p-1 gap-1 min-w-max z-40 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none lg:group-hover:pointer-events-auto'>
                        <Link to="/deposits/fd" className={submenuItemClass('/deposits/fd')}>
                            Fixed Deposit
                        </Link>
                        <Link to="/deposits/rd" className={submenuItemClass('/deposits/rd')}>
                            Recurring Deposit
                        </Link>
                    </div>

                    {/* Mobile Dropdown */}
                    {openDropdown === 'deposits' && (
                        <div className='lg:hidden grid grid-cols-1 pl-4 pt-2 gap-1'>
                            <Link to="/deposits/fd" className={mobileNavLinkClass('/deposits/fd')}>
                                Fixed Deposit
                            </Link>
                            <Link to="/deposits/rd" className={mobileNavLinkClass('/deposits/rd')}>
                                Recurring Deposit
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mutual Funds Dropdown */}
                <div className="transition-all duration-200 text-text-secondary relative group lg:group-hover:text-text-primary">
                    <button 
                        className={navLinkClass}
                        onClick={() => setOpenDropdown(openDropdown === 'mutual-funds' ? null : 'mutual-funds')}
                    >
                        <span className="flex items-center gap-1.5">
                            Mutual Funds
                            <svg className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'mutual-funds' ? 'rotate-180' : ''} lg:group-hover:rotate-180`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </span>
                    </button>
                    
                    {/* Desktop Dropdown */}
                    <div className='hidden lg:grid lg:group-hover:grid grid-cols-1 absolute top-full left-0 bg-bg-primary lg:border lg:border-border-main rounded-lg lg:shadow-lg p-1 gap-1 min-w-max z-40 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none lg:group-hover:pointer-events-auto'>
                        <Link to="/mutual-funds" className={submenuItemClass('/mutual-funds')}>
                            Explore Funds
                        </Link>
                        <Link to="/mutual-funds/my-funds" className={submenuItemClass('/mutual-funds/my-funds')}>
                            My Funds
                        </Link>
                        <Link to="/mutual-funds/watchlist" className={submenuItemClass('/mutual-funds/watchlist')}>
                            Watchlist
                        </Link>
                    </div>

                    {/* Mobile Dropdown */}
                    {openDropdown === 'mutual-funds' && (
                        <div className='lg:hidden grid grid-cols-1 pl-4 pt-2 gap-1'>
                            <Link to="/mutual-funds" className={mobileNavLinkClass('/mutual-funds')}>
                                Explore Funds
                            </Link>
                            <Link to="/mutual-funds/my-funds" className={mobileNavLinkClass('/mutual-funds/my-funds')}>
                                My Funds
                            </Link>
                            <Link to="/mutual-funds/watchlist" className={mobileNavLinkClass('/mutual-funds/watchlist')}>
                                Watchlist
                            </Link>
                        </div>
                    )}
                </div>

                {/* PPF Link */}
                <Link
                    to="/ppf"
                    className={`${navLinkClass} px-4` }
                >
                    PPF
                </Link>

                {/* Privacy & Terms Link */}
                <Link
                    to="/privacy"
                    className={`${navLinkClass} px-4` }
                >
                    Privacy & Terms
                </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden flex flex-col justify-center gap-1.5 p-2.5 rounded-lg transition-all duration-300 ${
                    isMenuOpen 
                        ? 'bg-bg-secondary' 
                        : 'bg-transparent hover:bg-bg-secondary'
                }`}
                aria-label="Toggle menu"
            >
                <span
                    className="w-6 h-0.5 bg-text-primary transition-all duration-300"
                    style={{
                        transform: isMenuOpen ? 'rotate(45deg) translateY(8px)' : 'rotate(0)',
                    }}
                />
                <span
                    className="w-6 h-0.5 bg-text-primary transition-all duration-300"
                    style={{
                        opacity: isMenuOpen ? '0' : '1',
                    }}
                />
                <span
                    className="w-6 h-0.5 bg-text-primary transition-all duration-300"
                    style={{
                        transform: isMenuOpen ? 'rotate(-45deg) translateY(-8px)' : 'rotate(0)',
                    }}
                />
            </button>
        </>
    )
}
