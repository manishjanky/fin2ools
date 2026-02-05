import { useState, useEffect } from 'react';
import type { MutualFundScheme } from '../types/mutual-funds';
import AddInvestmentModal from './AddInvestmentModal';
import { useInvestmentStore } from '../store';
import SchemeNAV from './SchemeNAV';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import { useWatchlistStore } from '../store/watchlistStore';

interface MutualFundCardProps {
    scheme: MutualFundScheme;
}

export default function MutualFundCard({ scheme }: MutualFundCardProps) {
    const [showModal, setShowModal] = useState(false);
    const [oneDayChange, setOneDayChange] = useState<number | null>(null);
    const [isLoadingChange, setIsLoadingChange] = useState(true);
    const { addInvestment } = useInvestmentStore();
    const { getOrFetchSchemeHistory } = useMutualFundsStore();
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlistStore();

    const inWatchlist = isInWatchlist(scheme.schemeCode);

    // Fetch 1D change data
    useEffect(() => {
        const fetch1DChange = async () => {
            try {
                setIsLoadingChange(true);
                // Fetch 2 days of data to calculate 1D change
                const historyData = await getOrFetchSchemeHistory(scheme.schemeCode, 2);

                if (historyData?.data && historyData.data.length >= 2) {
                    const previousNav = parseFloat(historyData.data[0].nav);
                    const latestNav = parseFloat(historyData.data[1].nav);
                    const change = ((latestNav - previousNav) / previousNav) * 100;
                    setOneDayChange(change);
                }
            } catch (error) {
                console.error('Error fetching 1D change:', error);
                setOneDayChange(null);
            } finally {
                setIsLoadingChange(false);
            }
        };

        fetch1DChange();
    }, [scheme.schemeCode, getOrFetchSchemeHistory]);

    const handleAddInvestment = (investment: any) => {
        addInvestment(scheme.schemeCode, investment);
        setShowModal(false);
    };
    const addToMyFunds = ($event: React.MouseEvent<HTMLElement>) => {
        $event.stopPropagation();
        setShowModal(true);
    };

    const toggleWatchlist = ($event: React.MouseEvent<HTMLButtonElement>) => {
        $event.stopPropagation();
        if (inWatchlist) {
            removeFromWatchlist(scheme.schemeCode);
        } else {
            addToWatchlist(scheme.schemeCode);
        }
    };

    return (
        <>
            <div
                className="rounded-lg p-3 hover:shadow-lg transition transform h-full border cursor-pointer bg-bg-secondary border-primary-lighter hover:border-primary-main"
            >
                <div className="flex flex-col h-full justify-between">
                    {/* Header: Scheme Name + NAV */}
                    <div>
                        <div className="flex items-start gap-2">
                            {/* Star Icon */}
                            <button
                                onClick={toggleWatchlist}
                                className="mt-1 shrink-0 text-text-secondary hover:text-warning transition"
                                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                            >
                                {inWatchlist ? (
                                    <svg className="w-6 h-6 fill-warning" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                    </svg>
                                )}
                            </button>

                            <div className="flex flex-col md:flex-row lg:items-start lg:justify-between lg:gap-4 flex-1">
                                <div className="flex-1">
                                    <h3
                                        className="text-lg font-bold lg:line-clamp-3 text-text-primary"
                                    >
                                        {scheme.schemeName}
                                    </h3>
                                    {/* Fund House and Category */}
                                    {scheme.fundHouse && (
                                        <p className="text-sm mb-1 text-primary-main">
                                            AMC: <b>{scheme.fundHouse}</b>
                                        </p>
                                    )}
                                    {scheme.schemeCategory && (
                                        <p className="text-xs text-text-secondary">
                                            Category: <b>{scheme.schemeCategory}</b>
                                        </p>
                                    )}

                                    {/* 1D Change */}
                                    {!isLoadingChange && oneDayChange !== null && (
                                        <div className="mt-1">
                                            <span className="text-xs text-text-secondary">1D Change: </span>
                                            <span className={`text-sm font-semibold ${oneDayChange >= 0 ? 'text-success' : 'text-error'}`}>
                                                {oneDayChange >= 0 ? '+' : ''}{oneDayChange.toFixed(2)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <SchemeNAV scheme={scheme} />
                                    <div className='flex justify-end'>
                                        <label
                                            role='button'
                                            onClick={addToMyFunds}
                                            className="w-full md:w-auto p-1 text-md text-primary hover:text-primary-dark cursor-pointer transition text-center font-bold"
                                        >
                                            + Add to My Funds
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AddInvestmentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleAddInvestment}
                schemeName={scheme.schemeName}
                schemeCode={scheme.schemeCode}
            />
        </>
    );
}
