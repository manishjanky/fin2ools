import { useState } from "react";
import type { RDInput } from "../types/deposits";

export default function RDForm() {
    const [formData, setFormData] = useState<RDInput>({
        monthlyInstallment: 0,
        rate: 0,
        startDate: '',
        tenureDays: 0,
        tenureMonths: 0,
        tenureYears: 0
    });

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

    return (
        <form className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-primary-lighter p-8 rounded-lg">
            <h2
                className="text-2xl font-bold mb-4 text-text-primary col-span-3"
            >
                RD Calculator
            </h2>
            <div>
                <label
                    className="block font-medium mb-2 text-text-secondary"
                >
                    Starte Date
                </label>
                <input className="w-full rounded-lg px-4 py-2 transition border bg-bg-secondary border-border-main text-text-primary focus:border-primary-main"
                    type="date"
                    name="startDate"
                    placeholder="DD/MM/YYYY"
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
                    step={0.1}
                />
            </div>
            <div
                className="rounded-lg p-6 bg-bg-secondary border border-border-light col-span-3"
            >
                <label
                    className="block font-semibold mb-4 text-text-secondary"
                >
                    Tenure
                </label>
                <div className="grid grid-cols-3 gap-4">
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
            <div className="col-span-3">
                <button
                    className="w-full font-bold py-3 px-6 rounded-lg transition text-lg bg-linear-to-r from-primary-main to-secondary-main text-text-inverse hover:opacity-90"
                >
                    Calculate
                </button>
            </div>
        </form>
    )
}