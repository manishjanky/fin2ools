import type { PPFSingleContribution } from '../types/ppf';

interface PPFYearContributionEditorProps {
    year: number;
    interestRate: number;
    onInterestRateChange: (rate: number) => void;
    contributions: PPFSingleContribution[];
    onContributionChange: (index: number, amount: number, date: string) => void;
    onAddContribution: () => void;
    onRemoveContribution: (index: number) => void;
    onApplyRateToFuture?: () => void;
    isNotLastYear: boolean;
}

const PPFYearContributionEditor = ({
    year,
    interestRate,
    onInterestRateChange,
    contributions,
    onContributionChange,
    onAddContribution,
    onRemoveContribution,
    onApplyRateToFuture,
    isNotLastYear,
}: PPFYearContributionEditorProps) => {
    const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);
    const maxAllowed = 150000;
    const remainingLimit = maxAllowed - totalAmount;

    return (
        <div
            className="border rounded-lg p-4 border-border-main"
        >
            <div className="mb-4">
                <label
                    className="block text-sm font-bold mb-2 text-text-secondary"
                >
                    FY {year}-{year + 1}
                </label>
                <p className="text-xs text-text-secondary">
                    Total contributions: ₹{totalAmount.toFixed(2)} / ₹150,000
                </p>
            </div>

            {/* Interest Rate Input */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label
                        className="block text-sm font-medium text-text-secondary"
                    >
                        Interest Rate (% per annum)
                    </label>
                    {isNotLastYear && (
                        <label
                            role="button"
                            onClick={onApplyRateToFuture}
                            className="text-md text-primary hover:text-primary-dark cursor-pointer transition text-center font-bold"
                            title="Apply this year's rate to all future years"
                        >
                            Apply to future →
                        </label>
                    )}
                </div>
                <input
                    type="number"
                    value={interestRate || ''}
                    onChange={(e) => onInterestRateChange(parseFloat(e.target.value) || 0)}
                    step="0.01"
                    placeholder="7.25"
                    className="w-full rounded-lg px-4 py-2 transition border bg-bg-primary border-border-main text-text-primary focus:border-primary-main"
                    onFocus={(e) => {
                        e.currentTarget.classList.add('border-primary-main');
                    }}
                    onBlur={(e) => {
                        e.currentTarget.classList.remove('border-primary-main');
                    }}
                />
            </div>

            {/* Contributions List */}
            <div className="mb-4 space-y-3">
                {contributions.map((contrib, index) => (
                    <>
                        <div
                            key={index}
                            className="p-3 rounded-lg flex gap-3 items-center bg-bg-primary"
                        >
                            <div className="flex-1">
                                <label
                                    className="block text-xs font-medium mb-1 text-text-secondary"
                                >
                                    Contribution {index + 1} - Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={contrib.amount}
                                    onChange={(e) =>
                                        onContributionChange(index, parseFloat(e.target.value), contrib.date || '')
                                    }
                                    max={remainingLimit + contrib.amount}
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full rounded px-3 py-1 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                                    onFocus={(e) => {
                                        e.currentTarget.classList.add('border-primary-main');
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.classList.remove('border-primary-main');
                                    }}
                                />
                            </div>

                            <div className="flex-1">
                                <label
                                    className="block text-xs font-medium mb-1 text-text-secondary"
                                >
                                    Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={contrib.date || ''}
                                    onChange={(e) => onContributionChange(index, contrib.amount, e.target.value)}
                                    className="w-full rounded px-3 py-1 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                                    onFocus={(e) => {
                                        e.currentTarget.classList.add('border-primary-main');
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.classList.remove('border-primary-main');
                                    }}
                                />
                            </div>
                            {(contributions.length > 1 || index > 0) && (
                                <div className="flex ">
                                    <button
                                        type="button"
                                        onClick={() => onRemoveContribution(index)}
                                        className="px-3 mt-4 rounded transition text-sm font-medium bg-warning text-text-inverse hover:opacity-80"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ))}
            </div>

            {/* Add Contribution Button */}
            {remainingLimit > 0 && (
                <button
                    type="button"
                    onClick={onAddContribution}
                    className="w-full px-3 py-2 rounded-lg transition text-sm font-medium bg-bg-secondary text-primary-main border border-dashed border-primary-main hover:bg-primary-lighter"
                >
                    + Add Another Contribution (Remaining: ₹{remainingLimit.toFixed(2)})
                </button>
            )}
        </div>
    );
};

export default PPFYearContributionEditor;
