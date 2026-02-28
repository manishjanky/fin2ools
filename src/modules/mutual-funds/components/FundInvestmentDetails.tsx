import { lazy, Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import type {
  MutualFundScheme,
  UserInvestmentData,
  NAVData,
  InvestmentInstallment,
  UserInvestment,
  InvestmentMetrics,
} from '../types/mutual-funds';
import {
  generateInvestmentInstallments,
  calculateInvestmentDuration,
} from '../utils/investmentCalculations';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import { useInvestmentStore } from '../store';
import FundHeader from './FundHeader';
import Accordion from '../../../components/common/Accordion';
import Loader from '../../../components/common/Loader';
import { getCalculatedReturns, getEarliestInvestmentDate } from '../utils';

const InvestmentPerformanceCurve = lazy(() => import('./InvestmentPerformanceCurve'));
const FundInvestmentSummary = lazy(() => import('./FundInvestmentSummary'));
const AddInvestmentModal = lazy(() => import('./AddInvestmentModal'));
const FundInvestmentHistory = lazy(() => import('./FundInvestmentHistory'));

export default function FundInvestmentDetails() {
  const { schemeCode } = useParams<{ schemeCode: string }>();
  const navigate = useNavigate();
  const { getSchemeInvestments, addInvestment, updateInvestment, calculatePortFolioRetruns, getAllInvestments, calculateSchemeReturns } = useInvestmentStore();
  const getOrFetchSchemeHistory = useMutualFundsStore(
    (state) => state.getOrFetchSchemeHistory
  );

  const [scheme, setScheme] = useState<MutualFundScheme | null>(null);
  const [navHistory, setNavHistory] = useState<NAVData[]>([]);
  const [investmentData, setInvestmentData] = useState<UserInvestmentData | null>(null);
  const [installments, setInstallments] = useState<InvestmentInstallment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingSIP, setEditingSIP] = useState<UserInvestment | null>(null);
  const [metrics, setMetrics] = useState<InvestmentMetrics>();

  getAllInvestments();

  const getInstallments = async (invData: UserInvestmentData, history: NAVData[]) => {
    // Generate installments
    const installs = await generateInvestmentInstallments(invData, history);
    setInstallments(installs);
  }

  useEffect(() => {
    const loadData = async () => {
      if (!schemeCode) return;

      try {
        const code = parseInt(schemeCode);
        // Get investment data
        const invData = getSchemeInvestments(code);
        if (!invData) {
          setLoading(false);
          return;
        }

        setInvestmentData(invData);
        const startDate = getEarliestInvestmentDate(invData.investments);

        const history = await getOrFetchSchemeHistory(code, startDate.date, false);
        if (history?.data) {
          setNavHistory(history.data);
          // Get latest NAV (most recent is at the end of array)
          const latestNav = history.data[history.data.length - 1];
          setScheme({
            schemeCode: code,
            schemeName: history.meta.schemeName,
            fundHouse: history.meta.fundHouse,
            schemeType: history.meta.schemeType,
            schemeCategory: history.meta.schemeCategory,
            isinGrowth: history.meta.isinGrowth,
            isinDivReinvestment: history.meta.isinDivReinvestment,
            nav: latestNav?.nav,
            date: latestNav?.date,
          });
          getInstallments(invData, history.data)
        }
      } catch (error) {
        console.error('Error loading investment details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [schemeCode]);

  const handleAddLumpsum = () => {
    setModalMode('add');
    setEditingSIP(null);
    setShowAddModal(true);
  };

  const handleEditSIP = (sip: UserInvestment) => {
    setModalMode('edit');
    setEditingSIP(sip);
    setShowAddModal(true);
  };

  const handleInvestmentSubmit = (investment: UserInvestment) => {
    if (scheme) {
      // Update investment in store
      if (modalMode === 'edit' && editingSIP) {
        updateInvestment(scheme.schemeCode, investment);
      } else {
        addInvestment(scheme.schemeCode, investment);

      }

      // Refresh investment data
      const updated = getSchemeInvestments(scheme.schemeCode);
      if (updated) {
        setInvestmentData(updated);
      }
      calculatePortFolioRetruns();
    }

    setShowAddModal(false);
    setEditingSIP(null);
  };

  useEffect(() => {
    if (investmentData) {
      getInstallments(investmentData, navHistory)
    }
  }, [investmentData])

  useEffect(() => {
    const getFundMetrics = async () => {
      if (!schemeCode || !investmentData) return;
      let investmentMetrics = await getCalculatedReturns(parseInt(schemeCode), false);
      if (investmentMetrics) {
        setMetrics(investmentMetrics.overallReturns);
      } else if (navHistory.length > 0 && investmentData.investments.length > 0) {
        // Fallback to on-the-fly calculation if not available in indexedDb
        await calculateSchemeReturns(parseInt(schemeCode))
        investmentMetrics = await getCalculatedReturns(parseInt(schemeCode), false);
        if (investmentMetrics) {
          setMetrics(investmentMetrics.overallReturns);
        }
      }
    }
    getFundMetrics();
  }, [investmentData, navHistory, schemeCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Loader message='Loading your investment details...' />
        </main>
      </div>
    );
  }

  if (!scheme || !investmentData) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <main className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center flex-col">
          <button
            onClick={() => navigate('/mutual-funds/my-funds')}
            className="mb-2 px-4 rounded-lg bg-primary-main text-text-inverse"
          >
            ← Back to My Funds
          </button>
          <p className="text-error">Investment data not found</p>
        </main>
      </div>
    );
  }


  const currentNav = scheme.nav ? parseFloat(scheme.nav) : 0;
  const investmentDuration = calculateInvestmentDuration(investmentData.investments);

  return (
    <div className="min-h-screen bg-bg-primary">
      {
        metrics && <main className="max-w-7xl mx-auto px-4 py-6">

          <FundHeader scheme={scheme} />

          <section className="mb-6">
            <Accordion title="Investment Summary" isOpen={true}>
              <Suspense fallback={<Loader message='Loading Summary...' />}>
                <FundInvestmentSummary
                  metrics={metrics}
                  currentNav={currentNav}
                  investmentData={investmentData}
                  navHistory={navHistory}
                  duration={investmentDuration}
                />
              </Suspense>
            </Accordion>
          </section>

          <section className="mb-6">
            <InvestmentPerformanceCurve
              fundDetails={[
                {
                  investmentData,
                  scheme
                }
              ]}
              navHistoryData={
                [
                  { data: navHistory, schemeCode: scheme.schemeCode }
                ]
              }
              investments={[investmentData]}
            />
          </section>

          {/* Action Buttons */}
          <section className="mb-6 flex gap-3 justify-end">
            <button
              onClick={handleAddLumpsum}
              className="rounded-lg transition font-medium bg-secondary-main text-text-inverse hover:opacity-90"
            >
              + Add Investment
            </button>

            {/* Show Edit SIP button only if there's an active SIP */}
            {investmentData.investments.some((inv) => inv.investmentType === 'sip' && !inv.sipEndDate) && (
              <button
                onClick={() => {
                  const activeSIP = investmentData.investments.find(
                    (inv) => inv.investmentType === 'sip' && !inv.sipEndDate
                  );
                  if (activeSIP) handleEditSIP(activeSIP);
                }}
                className="px-6 py-3 rounded-lg transition font-medium bg-primary-main text-text-inverse hover:bg-primary-dark"
              >
                Edit SIP
              </button>
            )}
          </section>
          <Suspense fallback={<Loader message='Loading investment history...' />}>
            <FundInvestmentHistory installments={installments} investmentData={investmentData}/>
          </Suspense>
        </main>
      }


      {/* Investment Modal (Add or Edit) */}
      {
        showAddModal && <Suspense>
          <AddInvestmentModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setEditingSIP(null);
            }}
            onSubmit={handleInvestmentSubmit}
            schemeName={scheme?.schemeName || ''}
            schemeCode={scheme?.schemeCode || 0}
            editingInvestment={editingSIP || undefined}
            mode={modalMode}
          />
        </Suspense>
      }


    </div>
  );
}
