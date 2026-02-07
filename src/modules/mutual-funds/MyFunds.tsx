import { useEffect, useState, lazy, Suspense } from 'react';
import Header from '../../components/common/Header';
import { useInvestmentStore } from './store';
import { useMutualFundsStore } from './store/mutualFundsStore';
import type { MutualFundScheme, UserInvestmentData } from './types/mutual-funds';
import MyFundsCard from './components/MyFundsCard';
import MyFundsSummary from './components/MyFundsSummary';
import Accordion from '../../components/common/Accordion';
import Loader from '../../components/common/Loader';
import { useNavigate } from 'react-router';

const PortfolioPerformanceCurve = lazy(
  () => import('./components/PortfolioPerformanceCurve')
);

export default function MyFunds() {
  const navigate = useNavigate();
  const { loadInvestments, getAllInvestments, hasInvestments } = useInvestmentStore();
  const { loadSchemes, getOrFetchSchemeDetails } = useMutualFundsStore();
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
            const scheme = await getOrFetchSchemeDetails(investmentData.schemeCode);
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
        setFundsWithDetails([]);
      } finally {
        setLoading(false);
      }
    };

    loadFundDetails();
  }, [getAllInvestments, hasInvestments, getOrFetchSchemeDetails]);


  return (
    <div
      className="min-h-screen bg-bg-primary"
    >
      <Header />
      <header
        className="backdrop-blur-sm py-4 bg-bg-primary"
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-4 items-center mb-4">
          <div>
            <h1
              className="text-4xl md:text-5xl font-bold text-text-primary"
            >
              My{' '}
              <span className="text-secondary-main">
                Funds({fundsWithDetails.length})
              </span>
            </h1>
            {fundsWithDetails.length > 0 && (
              <p className="text-md mt-2 text-text-secondary">
                {fundsWithDetails.length} {fundsWithDetails.length === 1 ? 'fund' : 'funds'} in your portfolio
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/mutual-funds/explore-funds')}
            className="px-6 py-2 rounded-lg font-medium transition  w-auto justify-self-end bg-bg-secondary text-text-secondary border border-border-main hover:bg-bg-tertiary"
          >
            Explore Funds
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {loading ? (
          <Loader message="Loading your investments..." fullHeight={true} />
        ) : fundsWithDetails.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center border bg-bg-primary border-border-main"
          >
            <p className="text-lg mb-6 text-text-secondary">
              You haven't added any mutual funds yet.
            </p>
            <button
              onClick={() => navigate('/mutual-funds/explore-funds')}
              className="px-6 py-3 rounded-lg transition font-medium bg-primary-main text-text-inverse hover:bg-primary-dark"
            >
              Explore Mutual Funds
            </button>


          </div>
        ) : (
          <>
            {/* Summary Section */}
            <section className="mb-6">
              <Suspense>
                <Accordion title="Portfolio Summary" isOpen={true}>
                  <MyFundsSummary fundsWithDetails={fundsWithDetails} />
                </Accordion>
              </Suspense>
            </section>

            {/* Portfolio Performance Curve */}
            <section className="mb-6">
              <Suspense
                fallback={
                  <div className="rounded-lg p-6 bg-bg-secondary border border-border-main">
                    <div className="h-96 flex items-center justify-center">
                      <Loader message="Loading portfolio performance..." fullHeight={false} />
                    </div>
                  </div>
                }
              >
                <PortfolioPerformanceCurve />
              </Suspense>
            </section>

            {/* Funds List */}
            <section className="grid grid-cols-1 gap-6 mb-8">
              {fundsWithDetails.map(({ scheme, investmentData }) => (
                <div
                  key={scheme.schemeCode}
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