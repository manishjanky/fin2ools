import { useState } from 'react';
import { useInvestmentStore } from '../store';
import type { MutualFundScheme } from '../types/mutual-funds';
import Modal from '../../../components/common/Modal';

export default function RemoveFund({ scheme, label, onClose }: { scheme: MutualFundScheme, label?: React.ReactNode, onClose?: () => void }) {

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { removeScheme } = useInvestmentStore();

    const remove = async () => {
        setLoading(true);
        try {
            // Remove the entire scheme and all its investments in one operation
            await removeScheme(scheme.schemeCode);
            setShowModal(false);
            onClose?.();
        } catch (error) {
            console.error('Error removing fund:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className='flex'>
                <label
                    role='button'
                    onClick={($event) => {
                        $event.stopPropagation();
                        setShowModal(true);
                    }}
                    className="w-full text-md text-red-600 dark:text-red-400 hover:text-red-800 cursor-pointer transition text-center font-bold"
                >
                    {label || "Remove Fund"}
                </label>
            </div>

            {showModal && (
                <div onMouseDown={(e) => e.stopPropagation()}>
                    <Modal onClose={() => setShowModal(false)} widthClass="max-w-md">
                        <div className='space-y-4'>
                            <h2 className='text-lg font-bold text-red-600'>Remove Fund</h2>
                            <p className='text-text-secondary'>
                                Are you sure you want to remove <strong>{scheme.schemeName}</strong> from your investments?
                            </p>
                            <p className='text-text-secondary'>
                                This will delete all investment records for this fund and recalculate your portfolio returns.
                            </p>
                            <p className='text-sm border border-border-main p-2 rounded'>
                                ⚠️ This action cannot be undone.
                            </p>
                            <div className='flex gap-3 justify-end pt-4'>
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    className='px-4 py-2 rounded-lg border disabled:opacity-50'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={remove}
                                    disabled={loading}
                                    className='px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition disabled:opacity-50 font-medium'
                                >
                                    {loading ? 'Removing...' : 'Yes, Remove Fund'}
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            )}
        </>
    );
}
