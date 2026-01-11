import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import type { MutualFundScheme, SchemeHistoryResponse } from './types/mutual-funds';
import { fetchSchemeDetails, fetchSchemeHistory } from './utils/mutualFundsService';
import Header from '../../components/common/Header';
import ReturnsCalculator from './components/ReturnsCalculator';
import moment from 'moment';
import Accordion from '../../components/common/Accordion';



export default function SchemeDetails() {
    const { schemeCode } = useParams<{ schemeCode: string }>();
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
                const schemeData = await fetchSchemeDetails(parseInt(schemeCode));

                if (schemeData) {
                    setScheme(schemeData);
                } else {
                    setError('Scheme not found');
                    setLoading(false);
                    return;
                }

                // Then, fetch history after scheme details are loaded
                const historyData = await fetchSchemeHistory(parseInt(schemeCode), 10);

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
    }, [schemeCode]);

    if (loading) {
        return (
            <div className="min-h-screen" style={{
                background: 'var(--color-bg-secondary)',
            }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <div
                            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                            style={{ borderColor: 'var(--color-primary-main)' }}
                        />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Loading scheme details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !scheme) {
        return (
            <div className="min-h-screen" style={{
                background: 'var(--color-bg-secondary)',
            }}>
                <Header />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div
                        className="rounded-lg p-6 mb-6 border"
                        style={{
                            backgroundColor: `${'var(--color-error)'}20`,
                            borderColor: 'var(--color-error)',
                            color: 'var(--color-error)',
                        }}
                    >
                        <p className="font-semibold mb-4">{error || 'Scheme not found'}</p>
                    </div>
                </main>
            </div>
        );
    }

    const currentNav = scheme.nav ? parseFloat(scheme.nav) : 0;

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-0">
                {/* Scheme Header */}
                <section className="mb-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                {scheme.schemeName}
                            </h1>

                            {scheme.fundHouse && (
                                <p className="text-blue-300 text-lg mb-2">
                                    <span className="text-blue-400 font-semibold">Fund House:</span> {scheme.fundHouse}
                                </p>
                            )}
                        </div>

                        {/* Latest NAV */}
                        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-lg p-2 text-right lg:min-w-48">
                            <p className="text-blue-300 text-sm mb-1">Latest NAV</p>
                            <p className="text-xl font-bold text-cyan-300 mb-1">₹{currentNav.toFixed(2)}</p>
                            {scheme.date && (
                                <p className="text-blue-400 text-md font-bold">As of {moment(scheme.date, 'DD-MM-YYYY').format('Do MMM YYYY')}</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Returns Summary */}
                {history && history.data.length > 0 && (
                    <section className="mb-8">
                        <h2
                          className="text-2xl font-bold mb-4"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          NAV History
                        </h2>
                        <ReturnsCalculator navData={history.data} currentNav={currentNav} />
                    </section>
                )}

                {/* Additional Info */}
                <Accordion title="Additional Information" isOpen={true}>
                    {(scheme.isinGrowth || scheme.isinDivReinvestment) && (
                        <section
                          className="rounded-lg p-6"
                          style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: `1px solid var(--color-border-light)`,
                          }}
                        >
                            <h3
                              className="text-xl font-bold mb-4"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              ISIN Details
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {scheme.schemeCategory && (
                                    <div>
                                        <p
                                          className="text-sm mb-2"
                                          style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                          Category
                                        </p>
                                        <p
                                          className="font-mono p-3 rounded"
                                          style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-primary)',
                                            border: `1px solid var(--color-border-light)`,
                                          }}
                                        >
                                            {scheme.schemeCategory}
                                        </p>
                                    </div>
                                )}

                                {scheme.schemeType && (
                                    <div>
                                        <p
                                          className="text-sm mb-2"
                                          style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                          Type
                                        </p>
                                        <p
                                          className="font-mono p-3 rounded"
                                          style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-primary)',
                                            border: `1px solid var(--color-border-light)`,
                                          }}
                                        >
                                            {scheme.schemeType}
                                        </p>
                                    </div>
                                )}
                                {scheme.isinGrowth && (
                                    <div>
                                        <p
                                          className="text-sm mb-2"
                                          style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                          Growth ISIN
                                        </p>
                                        <p
                                          className="font-mono p-3 rounded"
                                          style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-primary)',
                                            border: `1px solid var(--color-border-light)`,
                                          }}
                                        >
                                            {scheme.isinGrowth}
                                        </p>
                                    </div>
                                )}
                                {scheme.isinDivReinvestment && (
                                    <div>
                                        <p
                                          className="text-sm mb-2"
                                          style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                          Dividend Reinvestment ISIN
                                        </p>
                                        <p
                                          className="font-mono p-3 rounded"
                                          style={{
                                            color: 'var(--color-text-primary)',
                                            backgroundColor: 'var(--color-bg-primary)',
                                            border: `1px solid var(--color-border-light)`,
                                          }}
                                        >
                                            {scheme.isinDivReinvestment}
                                        </p>
                                    </div>
                                )}

                            </div>
                        </section>
                    )}
                </Accordion>
            </main>
        </div>
    );
}
