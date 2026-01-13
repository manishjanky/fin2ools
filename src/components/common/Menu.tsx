import { Link } from 'react-router';

export default function Menu({ isMobile }: { isMobile: boolean }) {
const classes = isMobile ? "grid grid-cols-1 md:hidden gap-4 mt-4 pt-4 border-t space-y-3" : "hidden md:flex space-x-8";
    return (
        <nav className={classes}>
            <Link
                to="/fd"
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
                FD
            </Link>
            <Link
                to="/mutual-funds/my-funds"
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
                My Funds
            </Link>
            <Link
                to="/mutual-funds/explore-funds"
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
                Explore Funds
            </Link>
            <Link
                to="/ppf"
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
                PPF
            </Link>
        </nav>
    )
}