import type { MutualFundScheme } from "../types/mutual-funds";
import SchemeNAV from "./SchemeNAV";
import AddToMyFunds from "./AddToMyFunds";

export default function FundHeader({ scheme, duration }: { scheme: MutualFundScheme; duration?: string }) {
    return (
        <section className="mb-6 border border-primary-lighter/30 rounded-lg p-2.5" >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-text-primary mb-1">
                        {scheme.schemeName}
                    </h1>

                    {scheme.fundHouse && (
                        <p className="text-info">
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
                            <p className="text-info">
                                <span className="text-info font-semibold">Investment Duration:</span> {duration}
                            </p>

                        )
                    }
                </div>
                <div>
                    <SchemeNAV scheme={scheme} />
                    <AddToMyFunds scheme={scheme} />
                </div>
            </div>
        </section >
    )
}