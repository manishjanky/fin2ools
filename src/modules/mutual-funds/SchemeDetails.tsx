import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import type { MutualFundScheme, SchemeHistoryResponse } from './types/mutual-funds';
import { useMutualFundsStore } from './store/mutualFundsStore';
import Header from '../../components/common/Header';
import Accordion from '../../components/common/Accordion';
import FundHeader from './components/FundHeader';
import Loader from '../../components/common/Loader';
import { isNavDataStale } from './utils';

const SchemeReturns = lazy(() => import('./components/SchemeReturns'));
const SchemeInformation = lazy(() => import('./components/SchemeInformation'));
const SimilarFunds = lazy(() => import('./components/SimilarFunds'));

export default function SchemeDetails() {
    const { schemeCode } = useParams<{ schemeCode: string }>();
    const { getOrFetchSchemeDetails, getOrFetchSchemeHistory } = useMutualFundsStore();
    const [scheme, setScheme] = useState<MutualFundScheme | null>(null);
    const [history, setHistory] = useState<SchemeHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isNavStale, setIsNavStale] = useState(false);


    useEffect(() => {
        const loadData = async () => {
            if (!schemeCode) return;

            try {
                setLoading(true);
                setError(null);
                setIsNavStale(false);

                // First, fetch scheme details
                const schemeData = await getOrFetchSchemeDetails(parseInt(schemeCode));

                if (schemeData) {
                    setScheme(schemeData);
                } else {
                    setError('Scheme not found');
                    setLoading(false);
                    return;
                }

                // Fetch maximum history available (10 years)
                const historyData = await getOrFetchSchemeHistory(parseInt(schemeCode), 3650); // 10 years of history

                if (historyData) {
                    setHistory(historyData);
                    
                    // Check if NAV data is stale (not from today or yesterday)
                    const isStale = isNavDataStale(historyData.data);
                    setIsNavStale(isStale);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to load scheme details';
                setError(errorMessage);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [schemeCode, getOrFetchSchemeDetails, getOrFetchSchemeHistory]);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-secondary">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 border-primary-main"
                        />
                        <p className="text-text-secondary">Loading scheme details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !scheme) {
        return (
            <div className="min-h-screen bg-bg-secondary">
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div
                        className="rounded-lg p-6 mb-6 border bg-error/20 border-error text-error"
                    >
                        <p className="font-semibold mb-4">{error || 'Scheme not found'}</p>
                    </div>
                </main>
            </div>
        );
    }

    const currentNav = scheme.nav ? parseFloat(scheme.nav) : 0;

    return (
        <div className="min-h-screen bg-bg-primary">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-4 mt-0 grid grid-cols-1 gap-6">
                <FundHeader scheme={scheme} />

                {/* Stale NAV Warning */}
                {isNavStale && (
                    <div
                        className="rounded-lg p-4 mb-2 border bg-warning/20 border-warning text-warning"
                    >
                        <p className="font-semibold">⚠️ Recent NAV Data Not Available</p>
                        <p className="text-sm mt-1">The latest NAV data for this scheme is from a previous date. Please check back later for the most recent NAV update.</p>
                    </div>
                )}

                {/* Returns Summary */}
                {history && history.data.length > 0 && (
                    <section className="">
                        <h2
                            className="text-2xl font-bold text-text-primary mb-2"
                        >
                            NAV History
                        </h2>
                        <Suspense fallback={<Loader />}>
                            <SchemeReturns navData={history.data} currentNav={currentNav} />
                        </Suspense>
                    </section>
                )}
                {
                    scheme.details && (
                        <Accordion title="Scheme Information" isOpen={true} >
                            <Suspense fallback={<Loader />}>
                                <SchemeInformation details={scheme.details} />
                            </Suspense>
                        </Accordion>
                    )
                }
                {
                    scheme.details && scheme.details.comparison?.length > 0 && (
                        <Accordion title="Similar Funds" isOpen={true} >
                            <Suspense fallback={<Loader />}>
                                <SimilarFunds funds={scheme.details.comparison} />
                            </Suspense>
                        </Accordion>
                    )
                }

                {/* Additional Info */}
                {(scheme.isinGrowth || scheme.isinDivReinvestment) && (
                    <Accordion title="Additional Information" isOpen={true}>
                        <section
                            className="rounded-lg p-6 bg-bg-secondary border border-border-light"
                        >
                            <div className="grid md:grid-cols-2 gap-6">
                                {scheme.schemeCategory && (
                                    <div>
                                        <p
                                            className="text-sm mb-2 text-text-secondary"
                                        >
                                            Category
                                        </p>
                                        <p
                                            className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                                        >
                                            {scheme.schemeCategory}
                                        </p>
                                    </div>
                                )}

                                {scheme.schemeType && (
                                    <div>
                                        <p
                                            className="text-sm mb-2 text-text-secondary"
                                        >
                                            Type
                                        </p>
                                        <p
                                            className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                                        >
                                            {scheme.schemeType}
                                        </p>
                                    </div>
                                )}
                                {scheme.isinGrowth && (
                                    <div>
                                        <p
                                            className="text-sm mb-2 text-text-secondary"
                                        >
                                            Growth ISIN
                                        </p>
                                        <p
                                            className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                                        >
                                            {scheme.isinGrowth}
                                        </p>
                                    </div>
                                )}
                                {scheme.isinDivReinvestment && (
                                    <div>
                                        <p
                                            className="text-sm mb-2 text-text-secondary"
                                        >
                                            Dividend Reinvestment ISIN
                                        </p>
                                        <p
                                            className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                                        >
                                            {scheme.isinDivReinvestment}
                                        </p>
                                    </div>
                                )}

                            </div>
                        </section>
                    </Accordion>
                )}
            </main>
        </div>
    );
}
