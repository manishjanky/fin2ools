import { useEffect, useState } from 'react';
import type { MutualFundScheme, UserInvestmentData, NAVData, InvestmentMetrics } from '../types/mutual-funds';
import { investmentMetricSingleFund } from '../utils/investmentCalculations';
import { useInvestmentStore } from '../store';
import SchemeNAV from './SchemeNAV';
import AddToMyFunds from './AddToMyFunds';
import { useNavigate } from 'react-router';
import moment from 'moment';
import { getCalculatedReturns } from '../utils';

interface MyFundsCardProps {
  scheme: MutualFundScheme;
  investmentData: UserInvestmentData;
  navHistory: NAVData[]
}

export default function MyFundsCard({ scheme, investmentData, navHistory }: MyFundsCardProps) {
  const navigate = useNavigate();
  const { getSchemeInvestments } = useInvestmentStore();
  const [investmentDataState, setInvestmentData] = useState<UserInvestmentData>(investmentData);
  const [investmentMetrics, setInvestmentMetrics] = useState<InvestmentMetrics>({
    totalInvested: 0,
    totalCurrentValue: 0,
    absoluteGain: 0,
    percentageReturn: 0,
    xirr: 0,
    cagr: 0,
    units: 0,
    oneDayChange: {
      absoluteChange: 0,
      percentageChange: 0,
    },
  });

  const [isPositive, setIsPositive] = useState(true);
  const [isOneDayPositive, setIsOneDayPositive] = useState(true);

  const investedFrom = investmentData.investments.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0]?.startDate;

  useEffect(() => {
    const getFundMetrics = async () => {
      if (navHistory.length === 0 || investmentDataState.investments.length === 0) {
        return;
      }
      let investmentMetrics = await getCalculatedReturns(scheme.schemeCode, false);
      if (investmentMetrics) {
        setInvestmentMetrics(investmentMetrics.overallReturns);
      } else {
        // Fallback to on-the-fly calculation if not available in indexedDb
        const calculatedMetrics = investmentMetricSingleFund(navHistory, investmentDataState);
        setInvestmentMetrics(calculatedMetrics);
      }
      setIsPositive((investmentMetrics?.overallReturns?.absoluteGain || 0) >= 0 || false);
      setIsOneDayPositive((investmentMetrics?.overallReturns?.oneDayChange?.absoluteChange || 0) >= 0 || false);
    }
    getFundMetrics();
  }, [investmentData, navHistory, scheme.schemeCode]);

  const handleAddInvestment = () => {
    if (scheme.schemeCode) {
      setInvestmentData(getSchemeInvestments(scheme.schemeCode));
    }
  };

  const handleCardClick = () => {
    if (scheme.schemeCode) {
      // Navigate to the investment details page for this scheme
      navigate(`/mutual-funds/my-funds//${scheme.schemeCode}`);
    }
  }

  const getIndicator = () => {
    return (
      <span className='flex'>
        <svg viewBox="0 0 200 100" width="24" height="24" className='border-l border-b'>
          {
            isPositive ? <polyline fill="none" stroke="#2ecc71" strokeWidth="24" points="0,90 50,60 100,70 150,30 200,10" strokeDasharray={400}
              strokeDashoffset={400}>
              <animate attributeName='stroke-dashoffset' from={400} to={0} dur='2s' begin='0s' repeatCount='indefinite' calcMode='linear' />
            </polyline>
              :
              <polyline fill="none" stroke="#e74c3c" strokeWidth="24" points="0,10 50,40 100,30 150,70 200,90" strokeDasharray={400}
              strokeDashoffset={400}>
                <animate attributeName='stroke-dashoffset' from={400} to={0} dur='2s' begin='0s' repeatCount='indefinite' calcMode='linear' />
              </polyline>
          }
        </svg>
      </span>

    )
  }


  return (
    <div
      className={`rounded-lg p-2.5 hover:shadow-lg transition border-2 border-b-5 cursor-pointer bg-bg-primary ${isPositive ? 'border-success' : 'border-warning'}`}
      onClick={handleCardClick}
    >
      <div className="grid md:grid-cols-3 gap-4 items-start">
        {/* Scheme Info */}
        <div className="md:col-span-2">
          <h4
            className="text-lg font-bold mb-1 line-clamp-2 text-text-primary flex gap-2 items-center"
          >
            {scheme.schemeName}{getIndicator()}
          </h4>
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
        className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-2 pt-2 border-t border-border-light"
      >
        <div>
          <p className="text-xs mb-1 text-text-tertiary font-extrabold">
            Amount Invested
          </p>
          <p className="text-md font-semibold text-text-primary">
            ₹{investmentMetrics.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary font-extrabold">
            Current Value
          </p>
          <p className="text-md font-semibold text-text-primary">
            ₹{investmentMetrics.totalCurrentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary font-extrabold">
            Gain / Loss
          </p>
          <p
            className={`text-md font-semibold ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {investmentMetrics.absoluteGain >= 0 ? '+' : ''}
            ₹{(investmentMetrics.absoluteGain).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary font-extrabold">
            Return %
          </p>
          <p
            className={`text-md font-semibold ${isPositive ? 'text-success' : 'text-error'}`}
          >
            {investmentMetrics.percentageReturn >= 0 ? '+' : ''}
            {investmentMetrics.percentageReturn.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary font-extrabold">
            1D Change
          </p>
          <p
            className={`text-md font-semibold ${isOneDayPositive ? 'text-success' : 'text-error'}`}
          >
            {(investmentMetrics.oneDayChange?.absoluteChange || 0) >= 0 ? '+' : ''}
            ₹{(investmentMetrics.oneDayChange?.absoluteChange || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1 text-text-tertiary font-extrabold">
            Units Held
          </p>
          <p
            className="text-md font-semibold text-secondary-main"
          >
            {investmentMetrics.units?.toFixed(4)}
          </p>
        </div>
      </div>
    </div>

  );
}
