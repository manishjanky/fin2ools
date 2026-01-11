import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import Header from '../../components/common/Header';
import AddInvestmentModal from './components/AddInvestmentModal';
import { useInvestmentStore } from './store';
import { fetchSchemeDetails, fetchSchemeHistory } from './utils/mutualFundsService';
import type { MutualFundScheme, SchemeHistoryResponse, UserInvestmentData } from './types/mutual-funds';
import moment from 'moment';
import ReturnsCalculator from './components/ReturnsCalculator';
import { calculateInvestmentValue } from './utils/investmentCalculations';

export default function MyFundDetails() {
  const { schemeCode } = useParams<{ schemeCode: string }>();
  const { getSchemeInvestments, addInvestment } = useInvestmentStore();

  const [scheme, setScheme] = useState<MutualFundScheme | null>(null);
  const [history, setHistory] = useState<SchemeHistoryResponse | null>(null);
  const [investmentData, setInvestmentData] = useState<UserInvestmentData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!schemeCode) return;

      try {
        setLoading(true);
        setError(null);

        const schemeDetails = await fetchSchemeDetails(parseInt(schemeCode));
        if (!schemeDetails) {
          setError('Scheme not found');
          setLoading(false);
          return;
        }
        setScheme(schemeDetails);

        const historyData = await fetchSchemeHistory(parseInt(schemeCode), 365);
        setHistory(historyData);

        const investments = getSchemeInvestments(parseInt(schemeCode));
        setInvestmentData(investments);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [schemeCode, getSchemeInvestments]);

  const handleAddInvestment = (investment: any) => {
    if (schemeCode) {
      addInvestment(parseInt(schemeCode), investment);
      setInvestmentData(getSchemeInvestments(parseInt(schemeCode)));
      setShowModal(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen" style={{
      background: `linear-gradient(to bottom, var(--color-bg-primary), var(--color-bg-secondary))`,
      }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderColor: 'var(--color-primary-main)' }}
            />
            <p style={{ color: "var(--color-text-secondary)" }}>Loading investment details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen" style={{
      background: `linear-gradient(to bottom, var(--color-bg-primary), var(--color-bg-secondary))`,
      }}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            className="rounded-lg p-6 mb-6 border"
            style={{
              backgroundColor: `var(--color-error)20`,
              borderColor: 'var(--color-error)',
              color: 'var(--color-error)',
            }}
          >
            <p className="font-semibold">{error || 'Fund not found'}</p>
          </div>
        </main>
      </div>
    );
  }

  const currentNav = scheme.nav ? parseFloat(scheme.nav) : 0;

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(to bottom, var(--color-bg-primary), var(--color-bg-secondary))`,
    }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Scheme Header */}
        <section
          className="mb-6 rounded-lg p-6 border"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-primary-lighter)',
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {scheme.schemeName}
              </h1>
              {scheme.fundHouse && (
                <p className="text-lg" style={{ color: 'var(--color-primary-main)' }}>
                  <span className="font-semibold">Fund House:</span> {scheme.fundHouse}
                </p>
              )}
            </div>

            {/* Latest NAV */}
            <div
              className="rounded-lg p-4 text-right lg:min-w-48 border"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-primary-main)',
              }}
            >
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                Latest NAV
              </p>
              <p
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--color-primary-main)' }}
              >
                ₹{currentNav.toFixed(2)}
              </p>
              {scheme.date && (
                <p className="text-sm font-bold" style={{ color: 'var(--color-primary-main)' }}>
                  As of {moment(scheme.date, 'DD-MM-YYYY').format('Do MMM YYYY')}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Investment Summary */}
        {investmentData && investmentData.investments.length > 0 && history && (
          <section className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {investmentData.investments.map((investment, idx) => {
              const value = calculateInvestmentValue(investment, history.data);
              const gain = value.currentValue - value.investedAmount;
              const gainPercent = (gain / value.investedAmount) * 100;
              const isPositive = gain >= 0;

              return (
                <div
                  key={idx}
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-border-light)',
                  }}
                >
                  <p
                    className="text-xs font-medium uppercase mb-2"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    {investment.investmentType === 'lumpsum' ? 'Lump Sum Investment' : 'SIP'}
                  </p>
                  <p
                    className="text-sm mb-3"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {moment(investment.startDate).format('MMM DD, YYYY')}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Amount Invested
                      </p>
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--color-secondary-main)' }}
                      >
                        ₹{value.investedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Current Value
                      </p>
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        ₹{value.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Gain / Loss
                      </p>
                      <p
                        className="font-semibold"
                        style={{
                          color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
                        }}
                      >
                        {gain >= 0 ? '+' : ''}₹{Math.abs(gain).toLocaleString('en-IN', {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        Return %
                      </p>
                      <p
                        className="font-semibold"
                        style={{
                          color: isPositive ? 'var(--color-success)' : 'var(--color-error)',
                        }}
                      >
                        {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Add Investment Button */}
        {investmentData && (
          <section className="mb-8">
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-lg transition font-medium"
              style={{
                backgroundColor: 'var(--color-primary-main)',
                color: 'var(--color-text-inverse)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-main)';
              }}
            >
              + Add More Investment
            </button>
          </section>
        )}

        {/* Returns Chart */}
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
      </main>

      <AddInvestmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddInvestment}
        schemeName={scheme.schemeName}
        schemeCode={scheme.schemeCode}
      />
    </div>
  );
}