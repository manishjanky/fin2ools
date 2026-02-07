import { useState } from 'react';
import moment from 'moment';
import type { FDInput, FDSummary as FDSummaryType } from '../types/fd';
import { calculateFDReturns } from '../utils/fdCalculator';
import FDSummary from './FDSummary';
import FYSummaryTable from '../../../components/common/FYSummaryTable';


export default function FDForm() {
  const [formData, setFormData] = useState<FDInput>({
    startDate: moment().format('YYYY-MM-DD'),
    principal: 100000.00,
    rate: 7.50,
    tenureYears: 5,
    tenureMonths: 0,
    tenureDays: 0,
    compounding: 'annually',
    payoutType: 'maturity',
  });
  const [summary, setSummary] = useState<FDSummaryType | null>(null);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const key = name as keyof FDInput;

    setFormData((prev) => ({
      ...prev,
      [key]:
        key === 'principal' || key === 'rate' || key === 'tenureYears' || key === 'tenureMonths' || key === 'tenureDays'
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = calculateFDReturns(formData);
    setSummary(result);
  };

  return (
    <div
      className="rounded-lg p-8 bg-bg-primary border border-primary-lighter"
    >
      <h2 
        className="text-2xl font-bold mb-6 text-text-primary"
      >
        FD Calculator
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Start Date */}
          <div>
            <label
              className="block font-medium mb-2 text-text-secondary"
            >
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
              onFocus={(e) => {
                e.currentTarget.classList.add('border-primary-main');
              }}
              onBlur={(e) => {
                e.currentTarget.classList.remove('border-primary-main');
                e.currentTarget.classList.add('border-border-main');
              }}
            />
          </div>

          {/* Principal Amount */}
          <div>
            <label
              className="block font-medium mb-2 text-text-secondary"
            >
              Principal Amount (₹)
            </label>
            <input
              type="number"
              name="principal"
              value={formData.principal}
              onChange={handleChange}
              min="1000"
              step="0.01"
              className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
              onFocus={(e) => {
                e.currentTarget.classList.add('border-primary-main');
              }}
              onBlur={(e) => {
                e.currentTarget.classList.remove('border-primary-main');
                e.currentTarget.classList.add('border-border-main');
              }}
            />
          </div>

          {/* Interest Rate */}
          <div>
            <label
              className="block font-medium mb-2 text-text-secondary"
            >
              Interest Rate (% per annum)
            </label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
              onFocus={(e) => {
                e.currentTarget.classList.add('border-primary-main');
              }}
              onBlur={(e) => {
                e.currentTarget.classList.remove('border-primary-main');
                e.currentTarget.classList.add('border-border-main');
              }}
            />
          </div>
        </div>

        {/* Tenure Section */}
        <div
          className="rounded-lg p-6 bg-bg-secondary border border-border-light"
        >
          <label
            className="block font-semibold mb-4 text-text-secondary"
          >
            Tenure
          </label>
          <div className="grid grid-cols-3 gap-4">
            {/* Tenure - Years */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-text-secondary"
              >
                Years
              </label>
              <input
                type="number"
                name="tenureYears"
                value={formData.tenureYears}
                onChange={handleChange}
                min="0"
                max="50"
                step="0.01"
                className="w-full rounded-lg px-4 py-2 transition border bg-bg-primary border-border-main text-text-primary focus:border-primary-main"
                onFocus={(e) => {
                  e.currentTarget.classList.add('border-primary-main');
                }}
                onBlur={(e) => {
                  e.currentTarget.classList.remove('border-primary-main');
                  e.currentTarget.classList.add('border-border-main');
                }}
              />
            </div>

            {/* Tenure - Months */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-text-secondary"
              >
                Months
              </label>
              <input
                type="number"
                name="tenureMonths"
                value={formData.tenureMonths}
                onChange={handleChange}
                min="0"
                max="11"
                step="0.01"
                className="w-full rounded-lg px-4 py-2 transition border bg-bg-primary border-border-main text-text-primary focus:border-primary-main"
                onFocus={(e) => {
                  e.currentTarget.classList.add('border-primary-main');
                }}
                onBlur={(e) => {
                  e.currentTarget.classList.remove('border-primary-main');
                  e.currentTarget.classList.add('border-border-main');
                }}
              />
            </div>

            {/* Tenure - Days */}
            <div>
              <label
                className="block text-sm font-medium mb-2 text-text-secondary"
              >
                Days
              </label>
              <input
                type="number"
                name="tenureDays"
                value={formData.tenureDays}
                onChange={handleChange}
                min="0"
                max="31"
                step="0.01"
                className="w-full rounded-lg px-4 py-2 transition border bg-bg-primary border-border-main text-text-primary focus:border-primary-main"
                onFocus={(e) => {
                  e.currentTarget.classList.add('border-primary-main');
                }}
                onBlur={(e) => {
                  e.currentTarget.classList.remove('border-primary-main');
                  e.currentTarget.classList.add('border-border-main');
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Compounding Frequency */}
          <div>
            <label
              className="block font-medium mb-2 text-text-secondary"
            >
              Compounding Frequency
            </label>
            <select
              name="compounding"
              value={formData.compounding}
              onChange={handleChange}
              className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
              onFocus={(e) => {
                e.currentTarget.classList.add('border-primary-main');
              }}
              onBlur={(e) => {
                e.currentTarget.classList.remove('border-primary-main');
                e.currentTarget.classList.add('border-border-main');
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="halfYearly">Half-Yearly</option>
              <option value="annually">Annually</option>
            </select>
          </div>

          {/* Payout Type */}
          <div>
            <label
              className="block font-medium mb-2 text-text-secondary"
            >
              Payout Type
            </label>
            <select
              name="payoutType"
              value={formData.payoutType}
              onChange={handleChange}
              className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
              onFocus={(e) => {
                e.currentTarget.classList.add('border-primary-main');
              }}
              onBlur={(e) => {
                e.currentTarget.classList.remove('border-primary-main');
                e.currentTarget.classList.add('border-border-main');
              }}
            >
              <option value="maturity">At Maturity</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 text-lg bg-gradient-to-r from-primary-main to-secondary-main text-text-inverse hover:opacity-90"
        >
          Calculate FD Returns
        </button>
      </form>


      {/* Results Section */}
      {summary && (
        <>
          {/* Summary Card */}
          <section className="mb-12 mt-12">
            <FDSummary summary={summary} />
          </section>

          {/* Results Table */}
          <section>
            <FYSummaryTable data={summary.fyData} />
          </section>
        </>
      )}
    </div>
  );
}
