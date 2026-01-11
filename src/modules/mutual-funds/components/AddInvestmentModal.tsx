import { useState } from 'react';
import type { UserInvestment } from '../types/mutual-funds';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (investment: UserInvestment) => void;
  schemeName: string;
  schemeCode: number;
}

export default function AddInvestmentModal({
  isOpen,
  onClose,
  onSubmit,
  schemeName,
  schemeCode,
}: AddInvestmentModalProps) {
  const [investmentType, setInvestmentType] = useState<'lumpsum' | 'sip'>('lumpsum');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [sipMonths, setSipMonths] = useState('12');
  const [sipAmount, setSipAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if ((investmentType === 'sip' && !sipAmount) || (investmentType === 'lumpsum' && !amount)) {
      alert('Please fill in all required fields');
      return;
    }

    const investment: UserInvestment = {
      schemeCode,
      investmentType,
      startDate,
      amount: investmentType === 'lumpsum' ? parseFloat(amount) : 0,
      sipAmount: investmentType === 'sip' ? parseFloat(sipAmount) : undefined,
      sipMonths: investmentType === 'sip' ? parseInt(sipMonths) : undefined,
    };

    onSubmit(investment);
    resetForm();
  };

  const resetForm = () => {
    setInvestmentType('lumpsum');
    setStartDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setSipMonths('12');
    setSipAmount('');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={($event) => $event.stopPropagation()}
    >
      <div
        className="rounded-lg p-8 max-w-md w-full border"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-primary-main)',
          color: 'var(--color-text-primary)',
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Add Investment
          </h2>
          <button
            onClick={onClose}
            className="transition text-2xl hover:opacity-70"
            style={{ color: 'var(--color-primary-main)' }}
          >
            ×
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
          {schemeName}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investment Type */}
          <div className="space-y-3">
            <label className="block font-medium" style={{ color: "var(--color-text-secondary)" }}>
              Investment Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="lumpsum"
                  checked={investmentType === 'lumpsum'}
                  onChange={(e) => setInvestmentType(e.target.value as 'lumpsum' | 'sip')}
                  className="w-4 h-4 mr-2"
                  style={{ accentColor: 'var(--color-primary-main)' }}
                />
                <span style={{ color: "var(--color-text-secondary)" }}>Lump Sum</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="sip"
                  checked={investmentType === 'sip'}
                  onChange={(e) => setInvestmentType(e.target.value as 'lumpsum' | 'sip')}
                  className="w-4 h-4 mr-2"
                  style={{ accentColor: 'var(--color-primary-main)' }}
                />
                <span style={{ color: "var(--color-text-secondary)" }}>SIP</span>
              </label>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg px-4 py-2 transition border"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-border-main)",
                color: "var(--color-text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary-main)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-main)';
              }}
            />
          </div>

          {/* Lump Sum Amount */}
          {investmentType === 'lumpsum' && (
            <div>
              <label className="block font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                Investment Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                className="w-full rounded-lg px-4 py-2 transition border"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-border-main)",
                  color: "var(--color-text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-main)';
                }}
              />
            </div>
          )}

          {/* SIP Details */}
          {investmentType === 'sip' && (
            <>
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Monthly Investment Amount (₹)
                </label>
                <input
                  type="number"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  placeholder="Enter monthly amount"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg px-4 py-2 transition border"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    borderColor: "var(--color-border-main)",
                    color: "var(--color-text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-main)';
                  }}
                />
              </div>
              <div>
                <label className="block font-medium mb-2" style={{ color: "var(--color-text-secondary)" }}>
                  Duration (Months)
                </label>
                <input
                  type="number"
                  value={sipMonths}
                  onChange={(e) => setSipMonths(e.target.value)}
                  placeholder="Enter number of months"
                  min="1"
                  className="w-full rounded-lg px-4 py-2 transition border"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    borderColor: "var(--color-border-main)",
                    color: "var(--color-text-primary)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border-main)';
                  }}
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg transition font-medium"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                color: "var(--color-text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg transition font-medium"
              style={{
                backgroundColor: 'var(--color-primary-main)',
                color: "var(--color-text-inverse)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary-dark)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-main)';
              }}
            >
              Add Investment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
