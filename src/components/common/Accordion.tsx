import { useState, type ReactNode } from 'react';

interface AccordionProps {
    title: string;
    isOpen: boolean;
    onToggle?: (isOpen: boolean) => void;
    children: ReactNode;
}

export default function Accordion({ title, isOpen, onToggle, children }: AccordionProps) {
    const [isAccordionOpen, setIsAccordionOpen] = useState(isOpen);

    return (
        <div
          className="rounded-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-light)',
          }}
        >
            {/* Accordion Header */}
            <button
                onClick={() => toggleAccordion()}
                className="w-full px-6 py-4 flex items-center justify-between transition"
                style={{
                  borderBottom: isAccordionOpen ? '1px solid var(--color-border-light)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-main)';
                  e.currentTarget.style.opacity = '0.1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.opacity = '1';
                }}
            >
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {title}
                </h3>
                <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                        {isAccordionOpen ? 'Hide' : 'Show'}
                    </span>
                    <svg
                        className={`w-5 h-5 transition-transform ${isAccordionOpen ? 'transform rotate-180' : ''}
                            `}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </button>

            {/* Accordion Content */}
            {isAccordionOpen && (
                <div
                  className="px-6 py-4"
                  style={{
                    borderTop: '1px solid var(--color-border-light)',
                    backgroundColor: 'var(--color-bg-primary)',
                  }}
                >
                    {children}
                </div>
            )}
        </div>
    );

    function toggleAccordion(): void {
        setIsAccordionOpen(!isAccordionOpen);
        onToggle?.(!isAccordionOpen);
    }
}
