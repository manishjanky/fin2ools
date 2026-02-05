export default function Footer() {

    return (
        <footer
            className="border-t pt-8 py-8"
            style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-main)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <p 
                        className="text-sm"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        &copy; 2026 fin2tools by Manish Kumar. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a
                            href="/privacy"
                            className="transition text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                            }}
                        >
                            Privacy & Terms
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

                {/* Powered By Section */}
                <div 
                    className="border-t pt-6"
                    style={{ borderColor: 'var(--color-border-main)' }}
                >
                    <p 
                        className="text-xs text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Powered by{' '}
                        <a 
                            href="https://www.mfapi.in" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline transition"
                            style={{ color: 'var(--color-primary-main)' }}
                        >
                            MFapi.in
                        </a>
                         {' '}&  <a 
                            href="https://mf.captnemo.in/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline transition"
                            style={{ color: 'var(--color-primary-main)' }}
                        >
                            https://mf.captnemo.in/
                        </a>
                        {' '}&bull;{' '}
                        Built with React, Tailwind CSS & Chart.js
                    </p>
                </div>
            </div>
        </footer>
    )
}
