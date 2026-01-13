import { useState } from 'react';
import type { PPFContribution, PPFCalculationResult, PPFSingleContribution } from '../types/ppf';
import { calculatePPF, getFiscalYearFromDate } from '../utils/ppfCalculator';
import { useAlert } from '../../../context/AlertContext';
import PPFFormBasics from './PPFFormBasics';
import PPFVariableContributionsModal from './PPFVariableContributionsModal';
import PPFContributionsSummary from './PPFContributionsSummary';

interface PPFFormProps {
  onCalculate?: (result: PPFCalculationResult) => void;
}

const PPFForm = ({ onCalculate }: PPFFormProps) => {
  const { showAlert } = useAlert();
  const currentYear = new Date().getFullYear();
  const PPF_MATURITY_YEARS = 15;
  const [startYear, setStartYear] = useState<number | null>(null);
  const [interestRate, setInterestRate] = useState(7.25);
  const [fixedContribution, setFixedContribution] = useState('');
  const [firstYearContributionDate, setFirstYearContributionDate] = useState('');
  const [variablePastContributions, setVariablePastContributions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [yearlyContributions, setYearlyContributions] = useState<PPFContribution[]>([]);

  // Initialize contributions for all 15 years
  const initializeContributions = (year: number) => {
    return Array.from({ length: PPF_MATURITY_YEARS }, (_, i) => ({
      year: year + i,
      interestRate: interestRate,
      contributions: [{ amount: 0, date: undefined }],
    }));
  };

  // Fill missing years and years with 0 contributions using last captured contribution
  const fillMissingYears = (contributions: PPFContribution[]) => {
    if (contributions.length === 0) return contributions;

    // Find the last year with actual contributions (amount > 0)
    let lastCapturedYear: PPFContribution | null = null;
    for (let i = contributions.length - 1; i >= 0; i--) {
      const hasActualContribution = contributions[i].contributions.some(c => c.amount > 0);
      if (hasActualContribution) {
        lastCapturedYear = contributions[i];
        break;
      }
    }

    if (!lastCapturedYear) return contributions;

    // Fill years with 0 contributions and missing years with last captured values
    const filled = contributions.map((contrib) => {
      const hasActualContribution = contrib.contributions.some(c => c.amount > 0);
      
      if (hasActualContribution) {
        return contrib;
      }
      
      // Year has no actual contributions, fill it with last captured values
      return {
        ...contrib,
        interestRate: lastCapturedYear!.interestRate,
        contributions: lastCapturedYear!.contributions.map(c => ({
          amount: c.amount,
          date: '' // Will default to April 1st
        })),
      };
    });

    // Add any missing years beyond the array
    for (let i = filled.length; i < PPF_MATURITY_YEARS; i++) {
      filled.push({
        year: startYear! + i,
        interestRate: lastCapturedYear.interestRate,
        contributions: lastCapturedYear.contributions.map(c => ({
          amount: c.amount,
          date: '' // Will default to April 1st
        })),
      });
    }

    return filled;
  };

  const handleStartYearChange = (newStartYear: number | null) => {
    setStartYear(newStartYear);
    if (newStartYear) {
      // Initialize contributions when start year is set
      const newContribs = initializeContributions(newStartYear);
      setYearlyContributions(newContribs);
    } else {
      setYearlyContributions([]);
    }
  };

  const handleToggleVariableContributions = () => {
    const newValue = !variablePastContributions;
    setVariablePastContributions(newValue);

    if (newValue) {
      // Open modal when checkbox is checked
      setShowModal(true);
      // Initialize yearly contributions with default interest rate if not already done
      if (yearlyContributions.length === 0 && startYear) {
        const newContribs = initializeContributions(startYear);
        setYearlyContributions(newContribs);
      }
    } else {
      // Clear contributions when checkbox is unchecked and reset first year date
      if (startYear) {
        const newContribs = initializeContributions(startYear);
        setYearlyContributions(newContribs);
      }
      setFirstYearContributionDate('');
      setShowModal(false);
    }
  };

  const handleContributionChange = (
    year: number,
    field: 'interestRate' | 'contributions',
    value: number | PPFSingleContribution[]
  ) => {
    setYearlyContributions(prev =>
      prev.map(c =>
        c.year === year ? { ...c, [field]: value } : c
      )
    );
  };

  const handleAddSingleContribution = (year: number) => {
    setYearlyContributions(prev =>
      prev.map(c =>
        c.year === year
          ? { ...c, contributions: [...c.contributions, { amount: 0, date: undefined }] }
          : c
      )
    );
  };

  const handleRemoveSingleContribution = (year: number, index: number) => {
    setYearlyContributions(prev =>
      prev.map(c =>
        c.year === year
          ? {
            ...c,
            contributions: c.contributions.filter((_, i) => i !== index),
          }
          : c
      )
    );
  };

  const handleApplyRateToFutureYears = (fromYear: number) => {
    const contribution = yearlyContributions.find(c => c.year === fromYear);
    if (contribution) {
      setYearlyContributions(prev =>
        prev.map(c =>
          c.year > fromYear ? { ...c, interestRate: contribution.interestRate } : c
        )
      );
    }
  };

  const handleCalculate = () => {
    if (!startYear) {
      showAlert('Please enter the start year', 'alert');
      return;
    }

    let contributions: PPFContribution[];

    if (variablePastContributions) {
      // Reorganize contributions to their correct fiscal years based on dates
      const normalizedContributions = normalizeContributionsByFiscalYear(yearlyContributions);
      
      // Validate that contributions start from the correct FY
      const minYear = Math.min(...normalizedContributions.map(c => c.year));
      if (minYear < startYear) {
        showAlert(`Some contributions fall in FY ${minYear}-${minYear + 1}, which is before the selected start year (FY ${startYear}-${startYear + 1}). Please adjust the dates or start year.`, 'warning');
        return;
      }
      
      // Fill missing years with last captured contribution
      contributions = fillMissingYears(normalizedContributions);
    } else {
      contributions = Array.from({ length: PPF_MATURITY_YEARS }, (_, i) => ({
        year: startYear + i,
        interestRate: interestRate,
        contributions: [
          {
            amount: fixedContribution ? parseFloat(fixedContribution) : 0,
            date: i === 0 ? firstYearContributionDate || undefined : undefined,
          },
        ],
      }));
    }

    const result = calculatePPF(startYear, interestRate, contributions);
    onCalculate?.(result);
  };

  /**
   * Reorganize contributions to their correct fiscal years based on dates
   * This ensures that a contribution dated 10 Jan 2019 is categorized under FY 2018-2019, not FY 2019-2020
   */
  const normalizeContributionsByFiscalYear = (contributions: PPFContribution[]): PPFContribution[] => {
    const yearMap = new Map<number, PPFSingleContribution[]>();

    contributions.forEach((yearData) => {
      yearData.contributions.forEach((contrib) => {
        // Determine correct fiscal year from date
        let correctYear = yearData.year;
        if (contrib.date) {
          correctYear = getFiscalYearFromDate(contrib.date);
        }

        if (!yearMap.has(correctYear)) {
          yearMap.set(correctYear, []);
        }
        yearMap.get(correctYear)!.push(contrib);
      });
    });

    // Build normalized contributions array, sorted by year
    const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
    const normalized: PPFContribution[] = years.map((year) => {
      const firstContribInYear = yearlyContributions.find(c => c.year === year);
      return {
        year,
        interestRate: firstContribInYear?.interestRate || interestRate,
        contributions: yearMap.get(year) || [],
      };
    });

    return normalized;
  };

  const handleClearVariableContributions = () => {
    if (startYear) {
      const newContribs = initializeContributions(startYear);
      setYearlyContributions(newContribs);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  return (
    <div
      className="rounded-lg p-8"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        border: '1px solid var(--color-primary-lighter)',
      }}
    >
      <h2
        className="text-2xl font-bold mb-6"
        style={{ color: 'var(--color-text-primary)' }}
      >
        PPF Calculator
      </h2>
      <form className="space-y-6">
        <PPFFormBasics
          startYear={startYear}
          onStartYearChange={handleStartYearChange}
          interestRate={interestRate}
          onInterestRateChange={setInterestRate}
          currentYear={currentYear}
        />

        {/* Only show rest of form if start year is captured */}
        {startYear && (
          <>
            {/* Fixed Contribution Inputs - Only show when variable is OFF */}
            {!variablePastContributions && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    Yearly Contribution
                  </label>
                  <input
                    type="number"
                    value={fixedContribution}
                    onChange={(e) => setFixedContribution(e.target.value)}
                    min="0"
                    max="150000"
                    step="0.01"
                    placeholder="Yearly Contribution Amount (₹)"
                    className="w-full rounded-lg px-4 py-2 transition border"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border-main)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-main)';
                    }}
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Max ₹150,000 per year
                  </p>
                </div>
                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    First Year Contribution Date
                  </label>
                  <input
                    type="date"
                    value={firstYearContributionDate}
                    onChange={(e) => setFirstYearContributionDate(e.target.value)}
                    className="w-full rounded-lg px-4 py-2 transition border"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      borderColor: 'var(--color-border-main)',
                      color: 'var(--color-text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-main)';
                    }}
                  />
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    For pro-rata interest calculation
                  </p>
                </div>
              </div>
            )}

            {/* Variable Contributions Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="variableContributions"
                checked={variablePastContributions}
                onChange={handleToggleVariableContributions}
                className="w-5 h-5 cursor-pointer"
                style={{
                  accentColor: 'var(--color-primary-main)',
                }}
              />
              <label
                htmlFor="variableContributions"
                className="font-medium cursor-pointer"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Use Variable Contributions (Multiple deposits per year, different rates)
              </label>
            </div>

            {/* Variable Contributions Summary - Show when variable is ON */}
            {variablePastContributions && yearlyContributions.length > 0 && (
              <PPFContributionsSummary 
                yearlyContributions={yearlyContributions}
                onEdit={handleOpenModal}
              />
            )}

            {showModal && variablePastContributions && (
              <PPFVariableContributionsModal
                startYear={startYear}
                yearlyContributions={yearlyContributions}
                onContributionChange={handleContributionChange}
                onAddSingleContribution={handleAddSingleContribution}
                onRemoveSingleContribution={handleRemoveSingleContribution}
                onApplyRateToFutureYears={handleApplyRateToFutureYears}
                onClearAll={handleClearVariableContributions}
                onClose={handleCloseModal}
              />
            )}
          </>
        )}

        <div className="block">
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!startYear}
            className="my-2 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 text-lg"
            style={{
              background: startYear
                ? 'linear-gradient(to right, var(--color-primary-main), var(--color-secondary-main))'
                : 'var(--color-border-main)',
              color: 'var(--color-text-inverse)',
              cursor: startYear ? 'pointer' : 'not-allowed',
              opacity: startYear ? 1 : 0.5,
            }}
          >
            Calculate
          </button>
        </div>
      </form>
    </div>
  );
};

export default PPFForm;