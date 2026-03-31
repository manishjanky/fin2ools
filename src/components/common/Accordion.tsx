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
          className="rounded-lg overflow-hidden bg-bg-secondary border border-border-light"
        >
            {/* Accordion Header */}
            <button
                onClick={() => toggleAccordion()}
                className={`w-full px-6 py-4 flex items-center justify-between transition hover:bg-bg-primary ${
                  isAccordionOpen ? 'border-b border-border-light' : ''
                }`}
            >
                <h3
                  className="text-lg font-semibold text-text-secondary"
                >
                  {title}
                </h3>
                <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium text-text-secondary"
                    >
                        {isAccordionOpen ? 'Hide' : 'Show'}
                    </span>
                    <svg
                        className={`w-5 h-5 transition-transform text-text-secondary ${isAccordionOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </button>

            {/* Accordion Content */}
            {isAccordionOpen && (
                <div
                  className="p-1 border-t border-border-light bg-bg-primary"
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
