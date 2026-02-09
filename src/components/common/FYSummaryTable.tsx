import type { FYData } from "../../types/fy-data";

interface FYSummaryTableProps {
  data: FYData[];
}

export default function FYSummaryTable({ data }: FYSummaryTableProps) {
  return (
    <div
      className="rounded-lg overflow-hidden bg-bg-secondary border border-border-light"
    >
      <div
        className="px-6 py-4 border border-border-light"
      >
        <h2
          className="text-2xl font-bold text-text-primary"
        >
          Financial Year-wise Breakdown
        </h2>
        <p
          className="text-sm mt-1 text-text-secondary"
        >
          Interest earned and balance details for each financial year
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="bg-bg-primary border border-e-border-light"
            >
              <th
                className="px-6 py-4 text-left font-semibold text-text-secondary"
              >
                Financial Year
              </th>
              <th
                className="px-6 py-4 text-right font-semibold text-text-secondary"
              >
                Opening Balance
              </th>
              <th
                className="px-6 py-4 text-right font-semibold text-text-secondary"
              >
                Amount Invested
              </th>
              <th
                className="px-6 py-4 text-right font-semibold text-text-secondary"
              >
                Interest Earned
              </th>
              <th
                className="px-6 py-4 text-right font-semibold text-text-secondary"
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
                }}
                className="border-b border-border-light"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'rgba(99, 102, 241, 0.05)' : 'transparent';
                }}
              >
                <td
                  className="px-6 py-4 font-medium text-text-primary"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {row.fyYear}
                </td>
                <td
                  className="px-6 py-4 text-right accent-cyan"
                  style={{ color: 'var(--color-accent-cyan)' }}
                >
                  ₹{row.startBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td
                  className="px-6 py-4 text-right font-semibold text-secondary-main"
                >
                  {row.contribution !== undefined && row.contribution > 0
                    ? `₹${row.contribution.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                    : '-'
                  }
                </td>
                <td
                  className="px-6 py-4 text-right font-semibold"
                  style={{ color: 'var(--color-status-success)' }}
                >
                  ₹{row.interestEarned.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </td>
                <td
                  className="px-6 py-4 text-right font-semibold text-primary-main"
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
        className="px-6 py-4 bg-bg-primary border border-border-light"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p
              className="text-sm text-text-secondary"
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
              className="text-sm text-text-secondary"
            >
              Spread over Financial Years
            </p>
            <p
              className="text-2xl font-bold mt-1 text-text-primary"
            >
              {data.length}
            </p>
          </div>
          <div>
            <p
              className="text-sm text-text-secondary"
            >
              Final Balance
            </p>
            <p
              className="text-2xl font-bold mt-1 text-primary-main"
            >
              ₹{(data[data.length - 1]?.endBalance || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}