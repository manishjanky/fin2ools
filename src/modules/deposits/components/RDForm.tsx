import { useState } from "react";
import type { DepositSummary, RDInput } from "../types/deposits";
import { calculateRDReturns } from "../utils";
import DepositReturns from "./DepositReturns";
import FYSummaryTable from "../../../components/common/FYSummaryTable";
import moment from "moment";

export default function RDForm() {
    const [formData, setFormData] = useState<RDInput>({
        monthlyInstallment: 10000,
        rate: 6.5,
        startDate: moment().format('YYYY-MM-DD'),
        tenureDays: 0,
        tenureMonths: 0,
        tenureYears: 3
    });
    const [summary, setSummary] = useState<DepositSummary | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        const key = name as keyof RDInput;

        setFormData((prev) => ({
            ...prev,
            [key]:
                Object.keys(formData).includes(key)
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = calculateRDReturns(formData);
        setSummary(result);
    };

    return (
        <div className="border border-primary-lighter p-4 rounded-lg">
            <h2
                className="text-2xl font-bold text-text-primary "
            >
                RD Calculator
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-3 gap-6 pt-4">
                    <div className="">
                        <label
                            className="block font-medium mb-2 text-text-secondary"

                        >
                            Starte Date
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
                    <div>
                        <label
                            className="block font-medium mb-2 text-text-secondary"
                        >
                            Monthly Installment
                        </label>
                        <input className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                            type="number"
                            name="monthlyInstallment"
                            placeholder="10000"
                            value={formData.monthlyInstallment}
                            onFocus={(e) => {
                                e.currentTarget.classList.add('border-primary-main');
                            }}
                            onBlur={(e) => {
                                e.currentTarget.classList.remove('border-primary-main');
                                e.currentTarget.classList.add('border-border-main');
                            }}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="">
                        <label
                            className="block font-medium mb-2 text-text-secondary"
                        >
                            Rate of Interest(%)
                        </label>
                        <input className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                            type="number"
                            name="rate"
                            placeholder="0.0"
                            value={formData.rate}
                            step={0.1}
                             onFocus={(e) => {
                                e.currentTarget.classList.add('border-primary-main');
                            }}
                            onBlur={(e) => {
                                e.currentTarget.classList.remove('border-primary-main');
                                e.currentTarget.classList.add('border-border-main');
                            }}
                            onChange={handleChange}
                        />
                    </div>
                    <div
                        className="rounded-lg p-3 bg-bg-secondary border border-border-light md:col-span-3"
                    >
                        <label
                            className="block font-semibold mb-4 text-text-secondary"
                        >
                            Tenure
                        </label>
                        <div className="grid grid-cols-2 gap-4">
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
                        </div>
                    </div>

                </div>
                <button
                    className="w-full font-bold py-3 px-6 rounded-lg transition text-lg bg-linear-to-r from-primary-main to-secondary-main text-text-inverse hover:opacity-90"
                >
                    Calculate
                </button>
            </form>
            {summary && (
                <>
                    {/* Summary Card */}
                    <section className="mb-12 mt-12">
                        <DepositReturns summary={summary} />
                    </section>

                    {/* Results Table */}
                    <section>
                        <FYSummaryTable data={summary.fyData} />
                    </section>
                </>
            )}
        </div>

    )
}