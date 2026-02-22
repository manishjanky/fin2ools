import moment from "moment";
import type { InvestmentInstallment } from "../types/mutual-funds";
import Pagination from "../../../components/common/Pagination";
import { useEffect, useMemo, useState } from "react";

export default function FundInvestmentHistory({ installments }: { installments: InvestmentInstallment[] }) {
    const PAGE_SIZE = 20;
    const [currentPage, setCurrentPage] = useState(1);

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