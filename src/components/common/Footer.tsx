export default function Footer() {

    return (
        <footer
            className="border-t pt-20 py-8"
            style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-main)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        &copy; 2026 fin-tools by Manish Kumar. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a
                            href="#"
                            className="transition text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                            }}
                        >
                            Privacy
                        </a>
                        <a
                            href="#"
                            className="transition text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                            }}
                        >
                            Terms
                        </a>
                        <a
                            href="#"
                            className="transition text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                            }}
                        >
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}