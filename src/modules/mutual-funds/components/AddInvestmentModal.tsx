import { useState, useEffect } from 'react';
import moment from 'moment';
import type { UserInvestment } from '../types/mutual-funds';
import Modal from '../../../components/common/Modal';
import { useAlert } from '../../../context/AlertContext';

/**
 * Convert HTML date input format (YYYY-MM-DD) to DD-MM-YYYY format
 */
const formatDateForStorage = (htmlDateFormat: string): string => {
  if (!htmlDateFormat) return '';
  // HTML input gives YYYY-MM-DD, we need DD-MM-YYYY
  const date = moment(htmlDateFormat, 'YYYY-MM-DD');
  return date.format('DD-MM-YYYY');
};

/**
 * Convert DD-MM-YYYY format to HTML date input format (YYYY-MM-DD)
 */
const formatDateForInput = (storageDateFormat: string): string => {
  if (!storageDateFormat) return '';
  // Storage format is DD-MM-YYYY, HTML input needs YYYY-MM-DD
  const date = moment(storageDateFormat, 'DD-MM-YYYY');
  return date.format('YYYY-MM-DD');
};

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (investment: UserInvestment) => void;
  schemeName: string;
  schemeCode: number;
  editingInvestment?: UserInvestment; // For editing existing SIP
  mode?: 'add' | 'edit'; // Mode of operation
}

export default function AddInvestmentModal({
  isOpen,
  onClose,
  onSubmit,
  schemeName,
  schemeCode,
  editingInvestment,
  mode = 'add',
}: AddInvestmentModalProps) {
  const { showAlert } = useAlert();
  const [investmentType, setInvestmentType] = useState<'lumpsum' | 'sip'>('lumpsum');
  // Store as YYYY-MM-DD for HTML input element, will convert to DD-MM-YYYY on submit
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [amount, setAmount] = useState('');
  const [sipAmount, setSipAmount] = useState('');

  const [sipMonthlyDate, setSipMonthlyDate] = useState('1');
  const [sipCancelled, setSipCancelled] = useState(false);
  const [sipEndDate, setSipEndDate] = useState('');
  const [sipAmountChangeDate, setSipAmountChangeDate] = useState(moment().format('YYYY-MM-DD'));
  const [isChangingAmount, setIsChangingAmount] = useState(false);

  // Initialize form when editing
  useEffect(() => {
    if (mode === 'edit' && editingInvestment) {
      setInvestmentType(editingInvestment.investmentType);
      // Convert DD-MM-YYYY to YYYY-MM-DD for HTML input
      setStartDate(formatDateForInput(editingInvestment.startDate));
      setAmount(editingInvestment.amount.toString());
      setSipAmount(editingInvestment.sipAmount?.toString() || '');
      setSipMonthlyDate(editingInvestment.sipMonthlyDate?.toString() || '1');
      setSipCancelled(!!editingInvestment.sipEndDate);
      // Convert DD-MM-YYYY to YYYY-MM-DD for HTML input
      setSipEndDate(editingInvestment.sipEndDate ? formatDateForInput(editingInvestment.sipEndDate) : '');
      setSipAmountChangeDate(moment().format('YYYY-MM-DD'));
      setIsChangingAmount(false);
    } else {
      resetForm();
    }
  }, [isOpen, mode, editingInvestment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if ((investmentType === 'sip' && !sipAmount) || (investmentType === 'lumpsum' && !amount)) {
      showAlert('Please fill in all required fields', 'alert');
      return;
    }

    if (investmentType === 'sip' && sipCancelled && !sipEndDate) {
      showAlert('Please provide SIP end date if SIP is cancelled', 'alert');
      return;
    }

    // For edit mode with SIP amount change, validate effective date
    if (isEditMode && investmentType === 'sip' && isChangingAmount && !sipAmountChangeDate) {
      showAlert('Please provide effective date for SIP amount change', 'alert');
      return;
    }

    let investment: UserInvestment = {
      schemeCode,
      investmentType,
      startDate: formatDateForStorage(startDate),
      amount: investmentType === 'lumpsum' ? parseFloat(amount) : 0,
      sipAmount: investmentType === 'sip' ? parseFloat(sipAmount) : undefined,
      sipMonthlyDate: investmentType === 'sip' ? parseInt(sipMonthlyDate) : undefined,
      sipEndDate: investmentType === 'sip' && sipCancelled ? formatDateForStorage(sipEndDate) : undefined,
    };

    // Handle SIP amount modification with effective date (past or future)
    if (isEditMode && investmentType === 'sip' && isChangingAmount && editingInvestment) {
      const newAmount = parseFloat(sipAmount);
      const oldAmount = editingInvestment.sipAmount || 0;

      // Validate effective date is not before SIP start date
      const effectiveDate = moment(sipAmountChangeDate, 'YYYY-MM-DD');
      const sipStartDate = moment(editingInvestment.startDate, 'DD-MM-YYYY');

      if (effectiveDate.isBefore(sipStartDate)) {
        showAlert(`Effective date cannot be before SIP start date (${sipStartDate.format('DD-MMM-YYYY')})`, 'warning');
        return;
      }

      // Only add modification if amount actually changed
      if (newAmount !== oldAmount) {
        const modifications = editingInvestment.sipAmountModifications || [];

        // Convert effective date to DD-MM-YYYY format
        const effectiveDateFormatted = formatDateForStorage(sipAmountChangeDate);

        // Check if modification for this date already exists
        const existingModIndex = modifications.findIndex(
          m => m.effectiveDate === effectiveDateFormatted
        );

        if (existingModIndex >= 0) {
          modifications[existingModIndex].amount = newAmount;
        } else {
          modifications.push({
            effectiveDate: effectiveDateFormatted,
            amount: newAmount,
          });
        }

        // Sort modifications by effective date
        modifications.sort((a, b) =>
          moment(a.effectiveDate, 'DD-MM-YYYY').diff(moment(b.effectiveDate, 'DD-MM-YYYY'))
        );

        investment.sipAmountModifications = modifications;
      }
    }

    onSubmit(investment);
    resetForm();
  };

  const resetForm = () => {
    setInvestmentType('lumpsum');
    setStartDate(moment().format('YYYY-MM-DD'));
    setAmount('');
    setSipAmount('');
    setSipMonthlyDate('1');
    setSipCancelled(false);
    setSipEndDate('');
    setSipAmountChangeDate(moment().format('YYYY-MM-DD'));
    setIsChangingAmount(false);
  };

  if (!isOpen) return null;

  const isEditMode = mode === 'edit';
  const modalTitle = isEditMode ? 'Edit SIP Investment' : 'Add Investment';
  const submitButtonText = isEditMode ? 'Update Investment' : 'Add Investment';

  // const onBackDropClick = (event: React.MouseEvent) => {
  //   event.stopPropagation();
  // }
  return (
    <div>
      <Modal onClose={onClose}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">
            {modalTitle}
          </h2>
        </div>

        <p className="text-sm mb-4 text-text-secondary">
          {schemeName}
        </p>

        {isEditMode && editingInvestment && (
          <div className="mb-6 p-3 rounded-lg bg-bg-secondary">
            <p className="text-xs text-text-secondary">
              Investment started on: <span className="font-semibold text-text-primary">
                {moment(editingInvestment.startDate, 'DD-MM-YYYY').format('D MMM YYYY')}
              </span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Investment Type - Only show in add mode */}
          {!isEditMode && (
            <div className="space-y-3">
              <label className="block font-medium text-text-secondary">
                Investment Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="lumpsum"
                    checked={investmentType === 'lumpsum'}
                    onChange={(e) => setInvestmentType(e.target.value as 'lumpsum' | 'sip')}
                    className="w-4 h-4 mr-2 accent-primary-main"
                  />
                  <span className="text-text-secondary">Lump Sum</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="sip"
                    checked={investmentType === 'sip'}
                    onChange={(e) => setInvestmentType(e.target.value as 'lumpsum' | 'sip')}
                    className="w-4 h-4 mr-2 accent-primary-main"
                  />
                  <span className="text-text-secondary">SIP</span>
                </label>
              </div>
            </div>
          )}

          {/* Start Date - Read-only in edit mode */}
          <div>
            <label className="block font-medium mb-2 text-text-secondary">
              {investmentType === 'lumpsum' ? 'Investment' : 'SIP Start'} Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isEditMode}
              className={`w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main ${isEditMode ? 'opacity-60 cursor-not-allowed' : 'cursor-auto'}`}
            />
          </div>

          {/* Lump Sum Amount */}
          {investmentType === 'lumpsum' && (
            <div>
              <label className="block font-medium mb-2 text-text-secondary">
                Investment Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
              />
            </div>
          )}

          {/* SIP Details */}
          {investmentType === 'sip' && (
            <>
              <div>
                <label className="block font-medium mb-2 text-text-secondary">
                  Monthly Investment Amount (₹)
                </label>
                <input
                  type="number"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(e.target.value)}
                  placeholder="Enter monthly amount"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                />
              </div>

              {/* Monthly Date - Only show in add mode or when editing */}
              {!isEditMode && (
                <div>
                  <label className="block font-medium mb-2 text-text-secondary">
                    Investment Date (Day of Month)
                  </label>
                  <input
                    type="number"
                    value={sipMonthlyDate}
                    onChange={(e) => {
                      const val = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
                      setSipMonthlyDate(val.toString());
                    }}
                    placeholder="Enter day of month (1-31)"
                    min="1"
                    max="31"
                    className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                  />
                  <p className="text-xs mt-1 text-text-tertiary">
                    Your SIP will be deducted on the {sipMonthlyDate === '1' ? '1st' : sipMonthlyDate === '2' ? '2nd' : sipMonthlyDate === '3' ? '3rd' : sipMonthlyDate + 'th'} of every month
                  </p>
                </div>
              )}





              {/* Effective Date for Amount Change - Only show when checkbox is checked */}
              {isEditMode && (
                <div>
                  <label className="block font-medium mb-2 text-text-secondary">
                    Effective Date for New Amount
                  </label>
                  <input
                    type="date"
                    value={sipAmountChangeDate}
                    onChange={(e) => setSipAmountChangeDate(e.target.value)}
                    className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                  />
                  <p className="text-xs mt-2 text-text-secondary">
                    Select a date from the past or future when this amount change takes effect
                  </p>
                  {editingInvestment && (
                    <>
                      <p className="text-xs mt-1 text-text-tertiary">
                        SIP started on: {moment(editingInvestment.startDate, 'DD-MM-YYYY').format('D MMM YYYY')}
                      </p>
                      <p className="text-xs mt-2 text-text-secondary">
                        <strong>Preview:</strong> Current Amount: ₹{editingInvestment?.sipAmount || 0} | New Amount: ₹{sipAmount || 0}
                        <br />
                        Change applies from {moment(sipAmountChangeDate, 'YYYY-MM-DD').format('D MMM YYYY')}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div>
                <label className="flex items-center cursor-pointer text-text-secondary">
                  <input
                    type="checkbox"
                    checked={sipCancelled}
                    onChange={(e) => setSipCancelled(e.target.checked)}
                    className="w-4 h-4 mr-2 accent-primary-main"
                  />
                  <span className="font-medium">{isEditMode ? 'Cancel SIP' : 'SIP is Cancelled'}</span>
                </label>
              </div>
              {sipCancelled && (
                <div>
                  <label className="block font-medium mb-2 text-text-secondary">
                    {isEditMode ? 'Cancellation Date' : 'SIP End Date'}
                  </label>
                  <input
                    type="date"
                    value={sipEndDate}
                    onChange={(e) => setSipEndDate(e.target.value)}
                    className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                  />
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg transition font-medium bg-bg-secondary text-text-secondary hover:bg-bg-tertiary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg transition font-medium bg-primary-main text-text-inverse hover:bg-primary-dark"
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
