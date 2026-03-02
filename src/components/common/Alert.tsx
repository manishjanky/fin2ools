import { useState, useEffect } from 'react';

interface AlertProps {
    message: string;
    type: 'success' | 'alert' | 'warning' | 'error';
    onClose?: () => void;
    autoCloseDuration?: number; // in milliseconds, 0 = manual close only
    showCloseIcon?: boolean
}

const Alert = ({ message, type, onClose, autoCloseDuration = 10000, showCloseIcon = true }: AlertProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoCloseDuration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
            }, autoCloseDuration);

            return () => clearTimeout(timer);
        }
    }, [autoCloseDuration, onClose]);

    if (!isVisible) return null;

    const getColors = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: 'var(--color-success)',
                    borderColor: 'var(--color-success)',
                    textColor: 'var(--color-text-inverse)',
                    iconColor: 'var(--color-text-inverse)',
                };
            case 'warning':
                return {
                    backgroundColor: 'var(--color-warning)',
                    borderColor: 'var(--color-warning)',
                    textColor: 'var(--color-text-inverse)',
                    iconColor: 'var(--color-text-inverse)',
                };
            case 'error':
                return {
                    backgroundColor: 'var(--color-warning)',
                    borderColor: 'var(--color-warning)',
                    textColor: 'var(--color-text-inverse)',
                    iconColor: 'var(--color-text-inverse)',
                }
            case 'alert':
            default:
                return {
                    backgroundColor: 'var(--color-info)',
                    borderColor: 'var(--color-info)',
                    textColor: 'var(--color-text-inverse)',
                    iconColor: 'var(--color-text-inverse)',
                };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'warning':
            case 'error':
                return '⚠';
            case 'alert':
            default:
                return '✕';
        }
    };

    const colors = getColors();
    const icon = getIcon();

    return (
        <div
            className="max-w-sm rounded-lg p-4 shadow-lg border-l-4 flex items-start gap-3 animate-slideIn z-50"
            style={{
                backgroundColor: colors.backgroundColor,
                borderLeftColor: colors.borderColor,
            }}
        >
            <span
                className="shrink-0 text-xl font-bold"
                style={{ color: colors.iconColor }}
            >
                {icon}
            </span>
            <div className="flex-1">
                <p
                    className="text-sm font-medium"
                    style={{ color: colors.textColor }}
                >
                    {message}
                </p>
            </div>
            {
                showCloseIcon && (<button
                    onClick={() => {
                        setIsVisible(false);
                        onClose && onClose();
                    }}
                    className="shrink-0 ml-2 text-lg font-semibold transition hover:opacity-70 bg-transparent"
                    style={{ color: colors.textColor }}
                    title="Close alert"
                >
                    ✕
                </button>)
            }

        </div>
    );
};

export default Alert;
