import { useEffect, useState, lazy, Suspense } from 'react';
import Header from '../../components/common/Header';
import { useInvestmentStore } from './store';
import { useMutualFundsStore } from './store/mutualFundsStore';
import type { MutualFundScheme, NAVData, PortfolioReturnMetrics, UserInvestmentData } from './types/mutual-funds';
import Accordion from '../../components/common/Accordion';
import Loader from '../../components/common/Loader';
import { useNavigate } from 'react-router';
import { calculateCAGRForInvestments, calculateInvestmentValue, calculateXIRR } from './utils/investmentCalculations';
import moment from 'moment';

const MyFundsCard = lazy(() => import('./components/MyFundsCard'));
const MyFundsSummary = lazy(() => import('./components/MyFundsSummary'));
const InvestmentPerformanceCurve = lazy(
  () => import('./components/InvestmentPerformanceCurve')
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

  const getOrFetchSchemeHistory = useMutualFundsStore(
    (state) => state.getOrFetchSchemeHistory
  );
  const [metrics, setMetrics] = useState<PortfolioReturnMetrics>({
    totalInvested: 0,
    totalCurrentValue: 0,
    absoluteGain: 0,
    percentageReturn: 0,
    xirr: 0,
    cagr: 0,
  });

  const [loading, setLoading] = useState(true);
  const [userInvestments, setUserInvestments] = useState<UserInvestmentData[]>();
  const [navHistoryData, setNavHistoryData] = useState<{ schemeCode: number; data: NAVData[] }[]>([]);

  useEffect(() => {
    loadInvestments();
    loadSchemes();
  }, [loadInvestments, loadSchemes]);

  useEffect(() => {
    const loadFundDetails = async () => {
      const investments = getAllInvestments();
      setUserInvestments(investments);

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

  useEffect(() => {
    const calculateMetrics = async () => {
      try {
        let totalInvested = 0;
        let totalCurrentValue = 0;
        let allInvestments: any[] = [];
        let allNavHistories: any[] = [];

        const historyData = await Promise.all(
          fundsWithDetails.map(async ({ scheme, investmentData }) => {
            const history = await getOrFetchSchemeHistory(scheme.schemeCode, 365);

            if (history?.data && Array.isArray(history.data) && history.data.length > 0) {
              for (const investment of investmentData.investments) {
                const value = calculateInvestmentValue(investment, history.data);
                totalInvested += value.investedAmount;
                totalCurrentValue += value.currentValue;
                allInvestments.push(investment);
              }
              allNavHistories.push(history.data);

            }
            return { schemeCode: scheme.schemeCode, data: history?.data || [] }
          })
        );


        const absoluteGain = totalCurrentValue - totalInvested;
        const percentageReturn = totalInvested > 0 ? (absoluteGain / totalInvested) * 100 : 0;

        // Calculate CAGR - need combined nav history
        let cagr = 0;
        if (allInvestments.length > 0 && allNavHistories.length > 0) {
          // Merge and sort all NAV histories
          const mergedNavHistory = allNavHistories
            .flat()
            .reduce((acc: typeof allNavHistories[0], current) => {
              const exists = (acc as typeof allNavHistories[0]).some((nav: any) => nav.date === current.date);
              if (!exists) (acc as typeof allNavHistories[0]).push(current);
              return acc;
            }, [] as typeof allNavHistories[0])
            .sort((a: any, b: any) => moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY')));

          cagr = calculateCAGRForInvestments(allInvestments, mergedNavHistory);
        }

        // Calculate XIRR for all investments across all funds
        let xirr = 0;
        if (allInvestments.length > 0 && allNavHistories.length > 0) {
          const mergedNavHistory = allNavHistories
            .flat()
            .reduce((acc: typeof allNavHistories[0], current) => {
              const exists = (acc as typeof allNavHistories[0]).some((nav: any) => nav.date === current.date);
              if (!exists) (acc as typeof allNavHistories[0]).push(current);
              return acc;
            }, [] as typeof allNavHistories[0])
            .sort((a: any, b: any) => moment(a.date, 'DD-MM-YYYY').diff(moment(b.date, 'DD-MM-YYYY')));

          xirr = calculateXIRR(allInvestments, mergedNavHistory);
        }

        setMetrics({
          totalInvested,
          totalCurrentValue,
          absoluteGain,
          percentageReturn,
          xirr,
          cagr,
        });
        setNavHistoryData(historyData);
      } catch (error) {
        console.error('Error calculating metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (fundsWithDetails.length > 0) {
      calculateMetrics();
    } else {
      setLoading(false);
    }
  }, [fundsWithDetails]);

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
              <Suspense fallback={<Loader />}>
                <Accordion title="Portfolio Summary" isOpen={true}>
                  {userInvestments?.length && metrics.totalInvested ? <MyFundsSummary metrics={metrics} /> :
                    <Loader />}
                </Accordion>
              </Suspense>
            </section>

            {/* Portfolio Performance Curve */}
            <section className="mb-6">
              <Suspense
                fallback={
                  <div className="rounded-lg p-6 bg-bg-secondary border border-border-main">
                    <div className="h-96 flex items-center justify-center">
                      <Loader message="Evaluating portfolio..." fullHeight={false} />
                    </div>
                  </div>
                }
              >
                {
                  userInvestments && navHistoryData?.length > 0 && (
                    <InvestmentPerformanceCurve investments={userInvestments || []} navHistoryData={navHistoryData} fundDetails={fundsWithDetails} />
                  )
                }
              </Suspense>
            </section>

            {/* Funds List */}
            <section className="grid grid-cols-1 gap-6 mb-8">
              {navHistoryData?.length > 0 && fundsWithDetails.map(({ scheme, investmentData }) => {
                const schemeNavHistory = navHistoryData.filter((schemeData) => schemeData.schemeCode === scheme.schemeCode)[0];
                return (
                  <div
                    key={scheme.schemeCode}
                    className="cursor-pointer"
                  >
                    <MyFundsCard
                      scheme={scheme}
                      investmentData={investmentData}
                      navHistory={schemeNavHistory.data}
                    />
                  </div>)
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}