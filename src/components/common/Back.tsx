import { useLocation, type useNavigate } from "react-router";

function Back({ navigate, label, to }: { navigate: ReturnType<typeof useNavigate>, label?: string, to?: string }) {
    const location = useLocation();
    const isRootRoute = location.pathname === '/';

    return (
        !isRootRoute && (
            <button
                onClick={() => to ? navigate(to) : navigate(-1)}
                className="px-4 py-2 rounded-lg transition mb-2"
                style={{
                    backgroundColor: 'var(--color-primary-main)',
                    color: 'var(--color-text-inverse)',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-main)';
                }}
            >
                ← {label || 'Back'}
            </button>
        )
    )
}

export default Back;