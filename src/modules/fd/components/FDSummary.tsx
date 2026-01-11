import type { FDSummary as FDSummaryType } from '../types/fd';

interface FDSummaryProps {
  summary: FDSummaryType;
}

export default function FDSummary({ summary }: FDSummaryProps) {
  const principal = summary.maturityAmount - summary.totalInterestEarned;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* Principal Card */}
      <div
        className="rounded-lg p-6 transition"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-main)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-light)';
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            className="font-semibold"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Principal
          </h3>
          <span className="text-2xl">💰</span>
        </div>
        <p
          className="text-3xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          ₹{principal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
        <p
          className="text-sm mt-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Initial investment
        </p>
      </div>

      {/* Total Interest Card */}
      <div
        className="rounded-lg p-6 transition"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-status-success)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-light)';
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            className="font-semibold"
            style={{ color: 'var(--color-status-success)' }}
          >
            Total Interest
          </h3>
          <span className="text-2xl">📈</span>
        </div>
        <p
          className="text-3xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          ₹{summary.totalInterestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
        <p
          className="text-sm mt-2"
          style={{ color: 'var(--color-status-success)' }}
        >
          Total earnings
        </p>
      </div>

      {/* Maturity Amount Card */}
      <div
        className="rounded-lg p-6 transition"
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-light)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary-main)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border-light)';
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <h3
            className="font-semibold"
            style={{ color: 'var(--color-primary-main)' }}
          >
            Maturity Amount
          </h3>
          <span className="text-2xl">🎯</span>
        </div>
        <p
          className="text-3xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          ₹{summary.maturityAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
        <p
          className="text-sm mt-2"
          style={{ color: 'var(--color-primary-main)' }}
        >
          Total at maturity
        </p>
      </div>
    </div>
  );
}
