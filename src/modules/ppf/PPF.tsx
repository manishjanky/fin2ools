import { useState } from 'react';
import PPFForm from './components/PPFForm';
import PPFReturnsSummary from './components/PPFReturnsSummary';
import FYSummaryTable from '../../components/common/FYSummaryTable';
import type { PPFCalculationResult } from './types/ppf';
import { generateFinancialYearData } from './utils/ppfCalculator';

const PPF = () => {
    const [result, setResult] = useState<PPFCalculationResult | null>(null);

    const handleCalculate = (calculationResult: PPFCalculationResult) => {
        setResult(calculationResult);
    };

    return (
        <div className="min-h-screen bg-bg-primary">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header */}
                <section className="mb-12">
                    <h1 
                        className="text-2xl md:text-4xl font-bold mb-4 text-text-primary"
                    >
                        PPF{' '}
                        <span className="text-primary-main">
                            Projections
                        </span>
                    </h1>
                    <p className="text-lg text-text-secondary">
                        Calculate and analyze your Public Provident Fund returns with detailed year-wise breakdowns.
                    </p>
                </section>

                {/* Form Section */}
                <section className="mb-12">
                    <PPFForm onCalculate={handleCalculate} />
                </section>

                {/* Results Section */}
                {result && (
                    <>
                        {/* Returns Summary */}
                        <section className="mb-12">
                            <PPFReturnsSummary result={result} />
                        </section>

                        {/* Financial Year Breakdown */}
                        <section className="mb-12">
                            <FYSummaryTable data={generateFinancialYearData(result.yearlyData)} />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default PPF;