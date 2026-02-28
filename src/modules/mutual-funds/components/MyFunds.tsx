import { useEffect, useState, lazy, Suspense } from 'react';
import { useInvestmentStore } from '../store';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import type { FundWithInvestments, InvestmentMetrics, NAVData, UserInvestmentData } from '../types/mutual-funds';
import Accordion from '../../../components/common/Accordion';
import Loader from '../../../components/common/Loader';
import { useNavigate } from 'react-router';
import { exportUserInevestments, getCalculatedReturns, getEarliestInvestmentDate, isNavDataStale } from '../utils/mutualFundsService';
import moment from 'moment';

const MyFundsCard = lazy(() => import('./MyFundsCard'));
const MyFundsSummary = lazy(() => import('./MyFundsSummary'));
const InvestmentPerformanceCurve = lazy(
  () => import('./InvestmentPerformanceCurve')
);

export default function MyFunds() {
  const navigate = useNavigate();
  const loadInvestments = useInvestmentStore((state) => state.loadInvestments);
  const getAllInvestments = useInvestmentStore((state) => state.getAllInvestments);
  const getOrFetchSchemeDetails = useMutualFundsStore((state) => state.getOrFetchSchemeDetails);
  const getOrFetchSchemeHistory = useMutualFundsStore((state) => state.getOrFetchSchemeHistory);
  const calculatePortfolioReturns = useInvestmentStore((state) => state.calculatePortFolioRetruns);

  const [fundsWithDetails, setFundsWithDetails] = useState<FundWithInvestments[]>([]);

  const [metrics, setMetrics] = useState<InvestmentMetrics>({
    totalInvested: 0,
    totalCurrentValue: 0,
    absoluteGain: 0,
    percentageReturn: 0,
    xirr: 0,
    cagr: 0,
  });

  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [userInvestments, setUserInvestments] = useState<UserInvestmentData[]>(getAllInvestments());
  const [navHistoryData, setNavHistoryData] = useState<{ schemeCode: number; data: NAVData[] }[]>([]);
  const [staleNavSchemes, setStaleNavSchemes] = useState<number[]>([]);

  const loadNavHistories = async () => {
    const historyData = await Promise.all(
      fundsWithDetails.map(async ({ scheme, investmentData }) => {
        const date = getEarliestInvestmentDate(investmentData.investments);
        const history = await getOrFetchSchemeHistory(scheme.schemeCode, date.diff, false);
        const data = history?.data.sort((a, b) =>
          moment(a.date, "DD-MM-YYYY").diff(moment(b.date, "DD-MM-YYYY"))
        ) || [];
        const isStale = isNavDataStale(data);
        if (isStale) {
          setStaleNavSchemes((prev) => [...prev, scheme.schemeCode]);
        }
        return {
          schemeCode: scheme.schemeCode,
          data: data,
        };
      })
    );
    setNavHistoryData(historyData);
  }

  const handleExportInvestments = () => {
    exportUserInevestments(userInvestments);
  }

  useEffect(() => {
    const loadUserInvestments = async () => {
      await loadInvestments();
      const invs = getAllInvestments();
      setUserInvestments(invs);
    }
    if (!userInvestments || userInvestments.length === 0) {
      loadUserInvestments();
    }
  }, []);



  const refreshReturnCalculations = async () => {
    await calculatePortfolioReturns();
    const freshReturns = await getCalculatedReturns(0, true);
    if (freshReturns) {
      setMetrics({ ...freshReturns.overallReturns });
    }
  }



  useEffect(() => {
    const loadFundDetails = async () => {
      setUserInvestments(userInvestments);

      if (userInvestments.length === 0) {
        setFundsWithDetails([]);
        setLoading(false);
        return;
      }

      try {
        const fundDetails = await Promise.all(
          userInvestments.map(async (investmentData) => {
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
        setLoading(false);
      } catch (error) {
        console.error('Error loading fund details:', error);
        setFundsWithDetails([]);
        setLoading(false);
      }
    };

    loadFundDetails();
  }, [userInvestments]);

  useEffect(() => {
    if (fundsWithDetails.length > 0 && navHistoryData.length === 0) {
      loadNavHistories();
    }
  }, [fundsWithDetails]);

  useEffect(() => {
    const loadMetrics = async () => {
      if (fundsWithDetails.length === 0) {
        setMetrics({
          totalInvested: 0,
          totalCurrentValue: 0,
          absoluteGain: 0,
          percentageReturn: 0,
          xirr: 0,
          cagr: 0,
        });
        setNavHistoryData([]);
        setStaleNavSchemes([]);
        return;
      }
      setMetricsLoading(true);
      try {

        const oldReturns = await getCalculatedReturns(0, true);
        const today = moment().format("DD-MM-YYYY");
        const cacheIsFresh = oldReturns && oldReturns.date === today;
        if (cacheIsFresh) {
          setMetrics({ ...oldReturns.overallReturns });
        } else {
          refreshReturnCalculations();
        }
      } catch (error) {
        console.error('Error calculating portfolio metrics:', error);
        refreshReturnCalculations();
      } finally {
        setMetricsLoading(false);
      }
    }
    loadMetrics();
  }, [fundsWithDetails]);

  return (
    <div
      className="min-h-screen bg-bg-primary"
    >
      <header
        className="backdrop-blur-sm py-4 bg-bg-primary"
      >
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-3 items-center mb-4">
          <div>
            <h1
              className="text-2xl md:text-4xl font-bold text-text-primary"
            >
              My{' '}
              <span className="text-secondary-dark">
                Funds({fundsWithDetails.length})
              </span>
            </h1>
            {fundsWithDetails.length > 0 && (
              <p className="text-md mt-2 text-text-secondary">
                {fundsWithDetails.length} {fundsWithDetails.length === 1 ? 'fund' : 'funds'} in your portfolio
              </p>
            )}
          </div>
          <div className='flex gap-2 justify-end'>
            <button
              title='Export your investment(s) info'
              onClick={handleExportInvestments}
              className="px-6 py-2 rounded-lg font-medium transition  w-auto justify-self-end bg-bg-secondary text-text-secondary border border-border-main hover:bg-bg-tertiary"
            >
              Export
            </button>

            <button
              onClick={() => navigate('/mutual-funds/explore-funds')}
              className="px-6 py-2 rounded-lg font-medium transition  w-auto justify-self-end bg-bg-secondary text-text-secondary border border-border-main hover:bg-bg-tertiary"
            >
              Explore Funds
            </button>
          </div>


        </div>
      </header >

      <main className="max-w-7xl mx-auto px-4">
        {/* Stale NAV Alert */}
        {!loading && staleNavSchemes.length > 0 && (
          <div
            className="rounded-lg p-4 mb-4 border bg-warning/20 border-warning text-warning"
          >
            <p className="font-semibold">⚠️ Recent NAV Data Not Available</p>
            <p className="text-sm mt-1">
              {staleNavSchemes.length} {staleNavSchemes.length === 1 ? 'fund has' : 'funds have'} NAV data from a previous date.
              Please check back later for the most recent updates.
            </p>
          </div>
        )}

        {loading ? (
          <Loader message="Loading your investments..." />
        ) : fundsWithDetails.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center border bg-bg-primary border-border-main"
          >
            <p className="text-lg mb-6 text-text-secondary">
              You haven't added any mutual funds yet.
            </p>
            <div className='flex gap-3 justify-center'>
              <button
                onClick={() => navigate('/mutual-funds/explore-funds')}
                className="px-6 py-3 rounded-lg transition font-medium bg-primary-main text-text-inverse hover:bg-primary-dark"
              >
                Explore Mutual Funds
              </button>
              <button
                onClick={() => navigate('/mutual-funds/explore-funds')}
                className="px-6 py-3 rounded-lg transition font-medium bg-primary-main text-text-inverse hover:bg-primary-dark"
              >
                Import Investments
              </button>
            </div>


          </div>
        ) : (
          <>
            {/* Summary Section */}
            <section className="mb-6">
              <Accordion title="Portfolio Summary" isOpen={true}>
                {metricsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader message="Calculating metrics..." fullHeight={false} />
                  </div>
                ) : (
                  <Suspense fallback={<Loader />}>
                    <MyFundsSummary metrics={metrics} />
                  </Suspense>
                )}
              </Accordion>
            </section>

            {/* Portfolio Performance Curve */}
            <section className="mb-6">
              {metricsLoading || navHistoryData.length === 0 ? (
                <div className="rounded-lg p-6 bg-bg-secondary border border-border-main">
                  <div className="h-96 flex items-center justify-center">
                    <Loader message="Evaluating portfolio..." fullHeight={false} />
                  </div>
                </div>
              ) : (
                <Suspense
                  fallback={
                    <div className="rounded-lg p-6 bg-bg-secondary border border-border-main">
                      <div className="h-96 flex items-center justify-center">
                        <Loader message="Evaluating portfolio..." fullHeight={false} />
                      </div>
                    </div>
                  }
                >
                  {userInvestments && navHistoryData?.length > 0 && (
                    <InvestmentPerformanceCurve investments={userInvestments || []} navHistoryData={navHistoryData} fundDetails={fundsWithDetails} />
                  )}
                </Suspense>
              )}
            </section>

            {/* Funds List */}
            <section className="grid grid-cols-1 gap-6 mb-8">
              {fundsWithDetails.map(({ scheme, investmentData }) => {
                const schemeNavHistory = navHistoryData.find((schemeData) => schemeData.schemeCode === scheme.schemeCode);
                return (
                  <div
                    key={scheme.schemeCode}
                    className="cursor-pointer"
                  >
                    <MyFundsCard
                      scheme={scheme}
                      investmentData={investmentData}
                      navHistory={schemeNavHistory?.data || []}
                    />
                  </div>)
              })}
            </section>
          </>
        )}
      </main>
    </div >
  );
}