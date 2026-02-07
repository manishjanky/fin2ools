import { createPortal } from "react-dom";

export default function Modal({ children, widthClass, onClose }: { children: React.ReactNode, widthClass?: string, onClose: () => void }) {

    const onModalClose = (event: React.MouseEvent) => {
        event.stopPropagation();
        onClose();
    }

    return createPortal(
        (
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex lg:items-center justify-center p-4"
            >
                <div
                    className={`rounded-lg p-6 border border-primary-main max-h-screen lg:max-h-[90vh] overflow-y-auto w-full bg-bg-primary text-text-primary relative ${widthClass ?? 'max-w-200'}`}
                >
                    <button
                        className="absolute right-0 top-0 bg-transparent z-50"
                        onClick={onModalClose}
                        aria-label="Close Modal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 absolute top-4 right-4 cursor-pointer hover:opacity-80 transition text-text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    {children}
                </div>
            </div>
        ),
        document.body
    )
}