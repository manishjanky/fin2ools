import type { FYData } from "../../types/fy-data";

interface FYSummaryTableProps {
  data: FYData[];
}

export default function FYSummaryTable({ data }: FYSummaryTableProps) {
      return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-light)',
      }}
    >
      <div
        className="px-6 py-4"
        style={{
          borderBottom: '1px solid var(--color-border-light)',
        }}
      >
        <h2
          className="text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Financial Year-wise Breakdown
        </h2>
        <p
          className="text-sm mt-1"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Interest earned and balance details for each financial year
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderBottom: '1px solid var(--color-border-light)',
              }}
            >
              <th
                className="px-6 py-4 text-left font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Financial Year
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Opening Balance
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Interest Earned
              </th>
              <th
                className="px-6 py-4 text-right font-semibold"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Closing Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent';
                }}
              >
                <td
                  className="px-6 py-4 font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {row.fyYear}
                </td>
                <td
                  className="px-6 py-4 text-right"
                  style={{ color: 'var(--color-accent-cyan)' }}
                >
                  ₹{row.startBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td
                  className="px-6 py-4 text-right font-semibold"
                  style={{ color: 'var(--color-status-success)' }}
                >
                  ₹{row.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td
                  className="px-6 py-4 text-right font-semibold"
                  style={{ color: 'var(--color-primary-main)' }}
                >
                  ₹{row.endBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Totals */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderTop: '1px solid var(--color-border-light)',
        }}
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Total Interest Earned
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--color-status-success)' }}
            >
              ₹{data.reduce((sum, row) => sum + row.interestEarned, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Spread over Financial Years
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {data.length}
            </p>
          </div>
          <div>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Final Balance
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{ color: 'var(--color-primary-main)' }}
            >
              ₹{(data[data.length - 1]?.endBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
    // Component implementation
}