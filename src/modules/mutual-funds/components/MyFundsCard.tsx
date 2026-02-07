import { useEffect, useState } from 'react';
import type { MutualFundScheme, UserInvestmentData, NAVData } from '../types/mutual-funds';
import { investmentMetricSingleFund } from '../utils/investmentCalculations';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import { useInvestmentStore } from '../store';
import SchemeNAV from './SchemeNAV';
import AddToMyFunds from './AddToMyFunds';
import { useNavigate } from 'react-router';
import moment from 'moment';

interface MyFundsCardProps {
  scheme: MutualFundScheme;
  investmentData: UserInvestmentData;
}

export default function MyFundsCard({ scheme, investmentData }: MyFundsCardProps) {
  const navigate = useNavigate();
  const getOrFetchSchemeHistory = useMutualFundsStore(
    (state) => state.getOrFetchSchemeHistory
  );
  const [navHistory, setNavHistory] = useState<NAVData[]>([]);
  const [, setLoading] = useState(true);
  const { getSchemeInvestments } = useInvestmentStore();
  const [investmentDataState, setInvestmentData] = useState<UserInvestmentData>(investmentData);
  const investedFrom = investmentData.investments.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]?.startDate;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getOrFetchSchemeHistory(scheme.schemeCode, 365);
        if (history?.data) {
          setNavHistory(history.data);
        }
      } catch (error) {
        console.error('Error loading NAV history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [scheme.schemeCode, getOrFetchSchemeHistory]);

  const investmentMetrics = investmentMetricSingleFund(navHistory, investmentDataState);
  const isPositive = investmentMetrics.absoluteGain >= 0;

  const handleAddInvestment = () => {
    if (scheme.schemeCode) {
      setInvestmentData(getSchemeInvestments(scheme.schemeCode));
    }
  };

  const handleCardClick = () => {
    if (scheme.schemeCode) {
      // Navigate to the investment details page for this scheme
      navigate(`/mutual-funds/my-funds/investment/${scheme.schemeCode}`);
    }
  }


  return (
    <div
      className="rounded-lg p-4 hover:shadow-lg transition border cursor-pointer bg-bg-primary border-primary-lighter hover:border-primary-main"
      onClick={handleCardClick}
    >
      <div className="grid md:grid-cols-3 gap-4 items-start">
        {/* Scheme Info */}
        <div className="md:col-span-2">
          <h3
            className="text-lg font-bold mb-2 line-clamp-2 text-text-primary"
          >
            {scheme.schemeName}
          </h3>
          {scheme.schemeCategory && (
            <p className="text-sm text-text-secondary">
              <span className="font-semibold">Category:</span> {scheme.schemeCategory}
            </p>
          )}
          {investedFrom && (
            <p className="text-sm text-text-secondary">
              <span className="font-semibold">Invested Since:</span> {moment(investedFrom, 'DD-MM-YYYY').format('MMM YYYY')}
            </p>
          )}
        </div>

        {/* Current NAV */}
        <div className="text-right max-w-sm md:ml-auto z-50">
          <SchemeNAV scheme={scheme} />
          <AddToMyFunds label="+ Add More Investments" scheme={scheme} onClose={handleAddInvestment} />
        </div>
      </div>

      {/* Investment Metrics */}
      <div
        className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-border-light"
      >
        <div>
          <p className="text-xs mb-1 text-text-tertiary">
            Amount Invested
          </p>
          <p className="text-lg font-semibold text-text-primary">
            ₹{investmentMetrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary">
            Current Value
          </p>
          <p className="text-lg font-semibold text-text-primary">
            ₹{investmentMetrics.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary">
            Gain / Loss
          </p>
          <p
            className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {investmentMetrics.absoluteGain >= 0 ? '+' : ''}
            ₹{Math.abs(investmentMetrics.absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary">
            Return %
          </p>
          <p
            className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {investmentMetrics.percentageReturn >= 0 ? '+' : ''}
            {investmentMetrics.percentageReturn.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary">
            Units Held
          </p>
          <p
            className="text-lg font-semibold text-secondary-main"
          >
            {investmentMetrics.units?.toFixed(4)}
          </p>
        </div>
      </div>
    </div>

  );
}
