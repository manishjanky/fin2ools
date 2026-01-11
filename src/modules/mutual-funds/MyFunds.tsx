import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Header from '../../components/common/Header';
import { useInvestmentStore } from './store';
import { useMutualFundsStore } from './store/mutualFundsStore';
import type { MutualFundScheme, UserInvestmentData } from './types/mutual-funds';
import { fetchSchemeDetails } from './utils/mutualFundsService';
import MyFundsCard from './components/MyFundsCard';
import MyFundsSummary from './components/MyFundsSummary';

export default function MyFunds() {
  const navigate = useNavigate();
  const { loadInvestments, getAllInvestments, hasInvestments } = useInvestmentStore();
  const { loadSchemes } = useMutualFundsStore();
  const [fundsWithDetails, setFundsWithDetails] = useState<
    Array<{
      scheme: MutualFundScheme;
      investmentData: UserInvestmentData;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestments();
    loadSchemes();
  }, [loadInvestments, loadSchemes]);

  useEffect(() => {
    const loadFundDetails = async () => {
      const investments = getAllInvestments();

      if (investments.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const fundDetails = await Promise.all(
          investments.map(async (investmentData) => {
            const scheme = await fetchSchemeDetails(investmentData.schemeCode);
            return {
              scheme: scheme || {
                schemeCode: investmentData.schemeCode,
                schemeName: 'Unknown Scheme',
              },
              investmentData,
            };
          })
        );
        setFundsWithDetails(fundDetails);
      } catch (error) {
        console.error('Error loading fund details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFundDetails();
  }, [getAllInvestments, hasInvestments]);

  const handleCardClick = (schemeCode: number) => {
    navigate(`/mutual-funds/scheme/${schemeCode}`);
  };



  const getHeaderStyle = () => ({
    backgroundColor: 'var(--color-bg-primary)',
    borderColor: 'var(--color-border-main)',
  });

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <Header />

      <header
        className="backdrop-blur-sm border-b py-6"
        style={getHeaderStyle()}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            My{' '}
            <span style={{ color: 'var(--color-secondary-main)' }}>
              Funds
            </span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: 'var(--color-primary-main)' }}
            />
            <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>
              Loading your investments...
            </p>
          </div>
        ) : fundsWithDetails.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center border"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              borderColor: 'var(--color-border-main)',
            }}
          >
            <p className="text-lg mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              You haven't added any mutual funds yet.
            </p>
            <button
              onClick={() => navigate('/mutual-funds/explore-funds')}
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
              Explore Mutual Funds
            </button>
          </div>
        ) : (
          <>
            {/* Summary Section */}
            <section className="mb-12">
              <MyFundsSummary fundsWithDetails={fundsWithDetails} />
            </section>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                className="px-6 py-2 rounded-lg font-medium transition disabled:opacity-75"
                style={{
                  backgroundColor: 'var(--color-primary-main)',
                  color: 'var(--color-text-inverse)',
                }}
                disabled
              >
                My Funds
              </button>
              <button
                onClick={() => navigate('/mutual-funds/explore-funds')}
                className="px-6 py-2 rounded-lg font-medium transition"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-secondary)',
                  border: `1px solid var(--color-border-main)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                }}
              >
                Explore More
              </button>
            </div>

            {/* Funds List */}
            <section className="grid grid-cols-1 gap-6">
              {fundsWithDetails.map(({ scheme, investmentData }) => (
                <div
                  key={scheme.schemeCode}
                  onClick={() => handleCardClick(scheme.schemeCode)}
                  className="cursor-pointer"
                >
                  <MyFundsCard
                    scheme={scheme}
                    investmentData={investmentData}
                  />
                </div>
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}