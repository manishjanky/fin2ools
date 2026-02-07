import { Link } from 'react-router';

export default function Menu({ isMobile }: { isMobile: boolean }) {
    const classes = isMobile ? "grid grid-cols-1 md:hidden gap-4 mt-4 pt-4 border-t border-border-light space-y-3" : "hidden md:flex space-x-8 items-center";
    return (
        <nav className={classes}>
            <Link
                to="/deposits/fd"
                className="transition text-text-secondary hover:text-text-primary relative group"
            >
                Deposits
                <div className='group-hover:flex hidden absolute top-full left-0 bg-bg-primary border border-border-light rounded-lg shadow-lg p-2 w-40 flex-col gap-3'>
                    <Link
                        to="/deposits/fd"
                        className="transition text-text-secondary hover:text-text-primary border-b border-border-light pb-2"
                    >
                        Fixed Deposit
                    </Link>
                    <Link
                        to="/deposits/rd"
                        className="transition text-text-secondary hover:text-text-primary pb-2"
                    >
                        Recurring Deposit
                    </Link>
                </div>

            </Link>
            <Link
                to="/mutual-funds"
                className="transition text-text-secondary hover:text-text-primary relative group"
            >
                Mutual Funds
                <div className='group-hover:flex hidden absolute top-full left-0 bg-bg-primary border border-border-light rounded-lg shadow-lg p-2 w-40 flex-col gap-3'>
                    <Link
                        to="/mutual-funds"
                        className="transition text-text-secondary hover:text-text-primary border-b border-border-light pb-2"
                    >
                        Explore Funds
                    </Link>
                    <Link
                        to="/mutual-funds/my-funds"
                        className="transition text-text-secondary hover:text-text-primary border-b border-border-light pb-2"
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

            </Link>
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
    )
}
