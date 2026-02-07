import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import type { MutualFundScheme, SchemeHistoryResponse } from './types/mutual-funds';
import { useMutualFundsStore } from './store/mutualFundsStore';
import Header from '../../components/common/Header';
import ReturnsCalculator from './components/ReturnsCalculator';
import Accordion from '../../components/common/Accordion';
import FundHeader from './components/FundHeader';
import SchemeInformation from './components/SchemeInformation';
import SimilarFunds from './components/SimilarFunds';

export default function SchemeDetails() {
    const { schemeCode } = useParams<{ schemeCode: string }>();
    const { getOrFetchSchemeDetails, getOrFetchSchemeHistory } = useMutualFundsStore();
    const [scheme, setScheme] = useState<MutualFundScheme | null>(null);
    const [history, setHistory] = useState<SchemeHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const loadData = async () => {
            if (!schemeCode) return;

            try {
                setLoading(true);
                setError(null);

                // First, fetch scheme details
                const schemeData = await getOrFetchSchemeDetails(parseInt(schemeCode));

                if (schemeData) {
                    setScheme(schemeData);
                } else {
                    setError('Scheme not found');
                    setLoading(false);
                    return;
                }

                // Then, fetch history after scheme details are loaded
                const historyData = await getOrFetchSchemeHistory(parseInt(schemeCode), 3650); // 10 years of history

                if (historyData) {
                    setHistory(historyData);
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

                {/* Returns Summary */}
                {history && history.data.length > 0 && (
                    <section className="">
                        <h2
                            className="text-2xl font-bold text-text-primary mb-2"
                        >
                            NAV History
                        </h2>
                        <Suspense>
                            <ReturnsCalculator navData={history.data} currentNav={currentNav} />
                        </Suspense>
                    </section>
                )}
                {
                    scheme.details && (
                        <Accordion title="Scheme Information" isOpen={true} >
                            <SchemeInformation details={scheme.details} />
                        </Accordion>
                    )
                }
                {
                    scheme.details && scheme.details.comparison?.length > 0 && (
                        <Accordion title="Similar Funds" isOpen={true} >
                            <SimilarFunds funds={scheme.details.comparison} />
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
