import type { InvestmentInstallment, NAVData, UserInvestmentData } from "../types/mutual-funds";
import Pagination from "../../../components/common/Pagination";
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useInvestmentStore } from "../store";
import { useAlert } from "../../../context/AlertContext";
import { generateInvestmentInstallments } from "../utils/investmentCalculations";

export default function FundInvestmentHistory({ schemeCode, navHistory }: { schemeCode: string; navHistory: NAVData[] }) {
    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const [installments, setInstallments] = useState<InvestmentInstallment[]>([]);
    const [investmentData, setInvestmentData] = useState<UserInvestmentData | null>(null);


    const {
        updateInvestment,
        removeInvestment,
        getSchemeInvestments
    } = useInvestmentStore();
    const { showAlert } = useAlert()

    const getInvestmentData = () => {
        const invData = getSchemeInvestments(parseInt(schemeCode));
        setInvestmentData(invData);
    }

    useEffect(() => {
        getInvestmentData();
    }, [schemeCode])


    useEffect(() => {
        setCurrentPage(1);
    }, [installments])

    const onPageChange = (page: number) => {
        setCurrentPage(page)
    };

    const itemsDisplayed = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return installments?.slice(start, start + PAGE_SIZE) || [];
    }, [installments, currentPage]);

    const handleSkipInstallment = async (installment: InvestmentInstallment) => {
        const investment = investmentData?.investments.find((inv) => inv.id === installment.investmentId)
        if (!investment) {
            showAlert('No such invested found!', 'warning');
            return;
        }
        if (installment.type === 'lumpsum' && investment) {
            const index = investmentData?.investments.findIndex((inv) => inv.id === installment.investmentId)
            await removeInvestment(investment.schemeCode, index!)
            showAlert('Lumpsum investment removed!', 'success');
            return;
        }
        if (investment && installment.type === 'sip-installment') {
            const installmentDate = installment.installmentDate;
            if (!investment.skippedInstallments) {
                investment.skippedInstallments = [];
            }
            investment.skippedInstallments.push(installmentDate)
            await updateInvestment(investment.schemeCode, investment);
            showAlert(`Skipped installment for ${installmentDate}`, 'success');
        }
        getInvestmentData();
    }

    const getInstallments = async (invData: UserInvestmentData, history: NAVData[]) => {
        if (!history || history.length === 0) return;
        // Generate installments
        const installs = await generateInvestmentInstallments(invData, history);
        setInstallments(installs);
    }


    useEffect(() => {
        if (investmentData) {
            getInstallments(investmentData, navHistory)
        }
    }, [investmentData, navHistory])

    return (
        <section className="rounded-lg overflow-hidden border bg-bg-secondary border-border-light"
        >
            <div className="px-6 py-4 border-b border-border-light">
                <h2 className="text-2xl font-bold text-text-primary">
                    Investment Installments
                </h2>
                <p className="text-sm mt-1 text-text-secondary">
                    All SIP and lump sum investment installments with NAV and units on transaction date
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-bg-primary">
                            <th className="px-6 py-4 text-left font-semibold text-text-secondary">
                                Type
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-text-secondary">
                                Investment Date
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-text-secondary">
                                NAV Date
                            </th>
                            <th className="px-6 py-4 text-right font-semibold text-text-secondary">
                                Amount
                            </th>
                            <th className="px-6 py-4 text-right font-semibold text-text-secondary">
                                Stamp Duty(0.005%)
                            </th>
                            <th className="px-6 py-4 text-right font-semibold text-text-secondary">
                                Applicable NAV
                            </th>

                            <th className="px-6 py-4 text-right font-semibold text-text-secondary">
                                Units
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsDisplayed.map((inst) => (
                            <tr key={inst.id} className="border-b border-border-light">
                                <td className="px-6 py-4 text-text-primary">
                                    <span className="font-semibold capitalize">
                                        {inst.type === 'lumpsum' ? 'Lump Sum' : 'SIP'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-text-primary">
                                    {moment(inst.installmentDate, 'DD-MM-YYYY').format('DD MMM YYYY')}
                                </td>
                                <td className="px-6 py-4 text-text-primary">
                                    {moment(inst.navDate, 'DD-MM-YYYY').format('DD MMM YYYY')}
                                </td>
                                <td className="px-6 py-4 text-right text-secondary-main">
                                    ₹{inst.amount.toFixed(3)}
                                </td>
                                <td className="px-6 py-4 text-right text-secondary-main">
                                    ₹{inst.stampDuty.toFixed(4)}
                                </td>
                                <td className="px-6 py-4 text-right text-text-primary">
                                    ₹{inst.nav}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold text-secondary-main">
                                    {inst.units.toFixed(4)}
                                </td>
                                <td>
                                    <span className="cursor-pointer p-1 text-accent-orange" onClick={() => handleSkipInstallment(inst)}>{
                                        inst.type === 'lumpsum' ? 'Remove' : 'Skip'
                                    }</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {
                installments && installments.length > PAGE_SIZE && (
                    <Pagination items={installments} itemsPerPage={PAGE_SIZE} pageChange={onPageChange} />
                )
            }
        </section>
    )
}