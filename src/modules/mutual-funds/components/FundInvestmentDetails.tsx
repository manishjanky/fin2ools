import { Suspense, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import type {
  MutualFundScheme,
  UserInvestmentData,
  NAVData,
  InvestmentInstallment,
  UserInvestment,
} from '../types/mutual-funds';
import {
  investmentMetricSingleFund,
  generateInvestmentInstallments,
  calculateInvestmentDuration,
} from '../utils/investmentCalculations';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import { useInvestmentStore } from '../store';
import Header from '../../../components/common/Header';
import FundInvestmentSummary from './FundInvestmentSummary';
import AddInvestmentModal from './AddInvestmentModal';
import Accordion from '../../../components/common/Accordion';
import Loader from '../../../components/common/Loader';
import FundInvestmentHistory from './FundInvestmentHistory';
import FundHeader from './FundHeader';

export default function FundInvestmentDetails() {
  const { schemeCode } = useParams<{ schemeCode: string }>();
  const navigate = useNavigate();
  const { getSchemeInvestments, addInvestment } = useInvestmentStore();
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

  useEffect(() => {
    const loadData = async () => {
      if (!schemeCode) return;

      try {
        setLoading(true);
        const code = parseInt(schemeCode);

        // Get investment data
        const invData = getSchemeInvestments(code);
        if (!invData) {
          setLoading(false);
          return;
        }

        setInvestmentData(invData);

        // Fetch scheme details and history
        const history = await getOrFetchSchemeHistory(code, 365);
        if (history?.data) {
          setNavHistory(history.data);
          // Get latest NAV (most recent is at the end of array)
          const latestNav = history.data[history.data.length - 1];
          setScheme({
            schemeCode: code,
            schemeName: history.meta.scheme_name,
            fundHouse: history.meta.fund_house,
            schemeType: history.meta.scheme_type,
            schemeCategory: history.meta.scheme_category,
            isinGrowth: history.meta.isin_growth,
            isinDivReinvestment: history.meta.isin_div_reinvestment,
            nav: latestNav?.nav,
            date: latestNav?.date,
          });

          // Generate installments
          const installs = generateInvestmentInstallments(invData, history.data);
          setInstallments(installs);
        }
      } catch (error) {
        console.error('Error loading investment details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [schemeCode, getSchemeInvestments]);

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
      addInvestment(scheme.schemeCode, investment);

      // Refresh investment data
      const updated = getSchemeInvestments(scheme.schemeCode);
      if (updated) {
        setInvestmentData(updated);

        // Regenerate installments with updated data
        const installs = generateInvestmentInstallments(updated, navHistory);
        setInstallments(installs);
      }
    }

    setShowAddModal(false);
    setEditingSIP(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Loader message='Loading your investment details...' />
        </main>
      </div>
    );
  }

  if (!scheme || !investmentData) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-center flex-col">
          <button
            onClick={() => navigate('/mutual-funds/my-funds')}
            className="mb-4 px-4 py-2 rounded-lg bg-primary-main text-text-inverse"
          >
            ← Back to My Funds
          </button>
          <p className="text-error">Investment data not found</p>
        </main>
      </div>
    );
  }

  const metrics = investmentMetricSingleFund(navHistory, investmentData);
  const currentNav = scheme.nav ? parseFloat(scheme.nav) : 0;
  const investmentDuration = calculateInvestmentDuration(investmentData.investments);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">

        <FundHeader scheme={scheme} duration={investmentDuration} />

        {/* Investment Summary */}
        <section className="mb-6">
          <Suspense>
            <Accordion title="Investment Summary" isOpen={true}>
              <FundInvestmentSummary
                metrics={metrics}
                currentNav={currentNav}
                investmentData={investmentData}
                navHistory={navHistory}
              />
            </Accordion>
          </Suspense>
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
        <Suspense>
          <FundInvestmentHistory installments={installments} />
        </Suspense>
      </main>

      {/* Investment Modal (Add or Edit) */}
      <Suspense>
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

    </div>
  );
}
