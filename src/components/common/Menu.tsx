import { useState } from 'react';
import { Link } from 'react-router';

export default function Menu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <nav className={
                isMenuOpen ? "grid grid-cols-1 mt-4 py-4 gap-4 border-t border-border-light absolute px-2 top-0 left-0 w-dvw bg-bg-primary" : "hidden lg:flex space-x-8 gap-8 items-center"
            }>
                <div
                    className="transition text-text-secondary hover:text-text-primary relative group"
                >
                    Deposits
                    <div className='w-full lg:w-48 md:pt-6 lg:pt-3 grid lg:group-hover:grid grid-cols-1 lg:hidden lg:absolute top-full left-0 bg-bg-primary lg:border lg:border-border-light rounded-lg lg:shadow-lg p-2 gap-3'>
                        <Link
                            to="/deposits/fd"
                            className="transition text-text-secondary hover:text-text-primary lg:border-b border-border-light pb-2"
                        >
                            Fixed Deposit
                        </Link>
                        <Link
                            to="/deposits/rd"
                            className="transition text-text-secondary hover:text-text-primary lg:pb-2"
                        >
                            Recurring Deposit
                        </Link>
                    </div>

                </div>
                <div
                    className="transition text-text-secondary hover:text-text-primary relative group"
                >
                    Mutual Funds
                    <div className='w-full lg:w-48 md:pt-6 lg:pt-3 grid lg:group-hover:grid grid-cols-1 lg:hidden lg:absolute top-full left-0 bg-bg-primary lg:border lg:border-border-light rounded-lg lg:shadow-lg p-2 gap-3'>
                        <Link
                            to="/mutual-funds"
                            className="transition text-text-secondary hover:text-text-primary lg:border-b border-border-light pb-2"
                        >
                            Explore Funds
                        </Link>
                        <Link
                            to="/mutual-funds/my-funds"
                            className="transition text-text-secondary hover:text-text-primary lg:border-b border-border-light pb-2"
                        >
                            My Funds
                        </Link>
                        <Link
                            to="/mutual-funds/watchlist"
                            className="transition text-text-secondary hover:text-text-primary "
                        >
                            Watchlist
                        </Link>

                    </div>
                </div>
                <Link
                    to="/ppf"
                    className="transition text-text-secondary hover:text-text-primary"
                >
                    PPF
                </Link>
                <Link
                    to="/privacy"
                    className="transition text-text-secondary hover:text-text-primary"
                >
                    Privacy & Terms
                </Link>
            </nav>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden flex flex-col justify-center gap-1 p-2 rounded-lg transition ${isMenuOpen ? 'bg-bg-secondary' : 'bg-transparent'
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
        </>

    )
}
