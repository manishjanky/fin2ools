import Modal from '../../../components/common/Modal';
import PPFYearContributionEditor from './PPFYearContributionEditor';
import type { PPFContribution } from '../types/ppf';

interface PPFVariableContributionsModalProps {
  startYear: number;
  yearlyContributions: PPFContribution[];
  onContributionChange: (
    year: number,
    field: 'interestRate' | 'contributions',
    value: number | Array<{ amount: number; date?: string }>
  ) => void;
  onAddSingleContribution: (year: number) => void;
  onRemoveSingleContribution: (year: number, index: number) => void;
  onApplyRateToFutureYears: (fromYear: number) => void;
  onClearAll: () => void;
  onClose: () => void;
}

const PPFVariableContributionsModal = ({
  startYear,
  yearlyContributions,
  onContributionChange,
  onAddSingleContribution,
  onRemoveSingleContribution,
  onApplyRateToFutureYears,
  onClearAll,
  onClose,
}: PPFVariableContributionsModalProps) => {
  return (
    <Modal onClose={onClose}>
      <h3
        className="font-bold text-md  mb-4 text-text-secondary"
      >
        Annual Contributions (15-Year Maturity Period - FY {startYear}-{startYear + 1} to FY{' '}
        {startYear + 14}-{startYear + 15})
      </h3>

      <div
        className="grid md:grid-cols-1 gap-4 lg:max-h-96 overflow-y-auto p-4 rounded-lg bg-bg-secondary"
      >
        {yearlyContributions.map((contrib, index) => (
          <PPFYearContributionEditor
            key={contrib.year}
            year={contrib.year}
            interestRate={contrib.interestRate}
            onInterestRateChange={(rate) =>
              onContributionChange(contrib.year, 'interestRate', rate)
            }
            contributions={contrib.contributions}
            onContributionChange={(contribIndex, amount, date) => {
              const updated = [...contrib.contributions];
              updated[contribIndex] = { amount, date: date || undefined };
              onContributionChange(contrib.year, 'contributions', updated);
            }}
            onAddContribution={() => onAddSingleContribution(contrib.year)}
            onRemoveContribution={(contribIndex) =>
              onRemoveSingleContribution(contrib.year, contribIndex)
            }
            onApplyRateToFuture={() => onApplyRateToFutureYears(contrib.year)}
            isNotLastYear={index < yearlyContributions.length - 1}
          />
        ))}
      </div>

      <div className="w-full flex col-span-full justify-end gap-3 mt-6">
        <button
          onClick={onClearAll}
          type="button"
          className="px-6 py-3 rounded-lg transition font-medium bg-bg-secondary border border-border-main hover:opacity-80"
        >
          Clear All
        </button>
        <button
          onClick={onClose}
          type="button"
          className="px-6 py-3 rounded-lg transition font-medium bg-primary-main text-text-inverse hover:bg-primary-dark"
        >
          Done
        </button>
      </div>
    </Modal>
  );
};

export default PPFVariableContributionsModal;
