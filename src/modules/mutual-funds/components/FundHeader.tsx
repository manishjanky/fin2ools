import { useState } from "react";
import { useInvestmentStore } from "../..";
import type { MutualFundScheme } from "../types/mutual-funds";
import AddInvestmentModal from "./AddInvestmentModal";
import SchemeNAV from "./SchemeNAV";

export default function FundHeader({ scheme, duration }: { scheme: MutualFundScheme; duration?: string }) {

    const [showModal, setShowModal] = useState(false);
    const { addInvestment } = useInvestmentStore();
    const handleAddInvestment = (investment: any) => {
        addInvestment(scheme.schemeCode, investment);
        setShowModal(false);
    }
    function addToMyFunds($event: React.MouseEvent<HTMLElement>) {
        $event.stopPropagation();
        setShowModal(true);
    }

    return (
        <section className="mb-4 border border-primary-lighter/30 rounded-lg p-4" >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
                        {scheme.schemeName}
                    </h1>

                    {scheme.fundHouse && (
                        <p className="text-info text-lg mb-2">
                            <span className="text-info font-semibold">Fund House:</span> {scheme.fundHouse}
                        </p>
                    )}
                    {scheme.schemeCategory && (
                        <p className="text-xs text-text-secondary">
                            Category: <b>{scheme.schemeCategory}</b>
                        </p>
                    )}
                    {
                        duration && (
                            <p className="text-info text-lg">
                                <span className="text-info font-semibold">Investment Duration:</span> {duration}
                            </p>

                        )
                    }
                </div>
                <div>
                    <SchemeNAV scheme={scheme} />
                    <div className='flex justify-end'>
                        <label
                            role='button'
                            onClick={addToMyFunds}
                            className="w-full md:w-auto p-1 text-md text-primary hover:text-primary-dark cursor-pointer transition text-center font-bold"
                        >
                            + Add to My Funds
                        </label>
                    </div>
                </div>
            </div>

            <AddInvestmentModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleAddInvestment}
                schemeName={scheme.schemeName}
                schemeCode={scheme.schemeCode}
            />
        </section >
    )
}