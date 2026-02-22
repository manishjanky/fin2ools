import type { MutualFundScheme } from "../types/mutual-funds";
import SchemeNAV from "./SchemeNAV";
import AddToMyFunds from "./AddToMyFunds";

export default function FundHeader({ scheme }: { scheme: MutualFundScheme; }) {
    return (
        <section className="mb-6 border border-primary-lighter/30 rounded-lg p-2.5" >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-text-primary mb-1">
                        {scheme.schemeName}
                    </h1>

                    {scheme.fundHouse && (
                        <p className="text-md">
                            <span className="text-secondary-main font-semibold">Fund House:</span> {scheme.fundHouse}
                        </p>
                    )}
                    {scheme.schemeCategory && (
                        <p className="text-md text-secondary-main">
                            Category: <b>{scheme.schemeCategory}</b>
                        </p>
                    )}
                </div>
                <div>
                    <SchemeNAV scheme={scheme} />
                    <AddToMyFunds scheme={scheme} />
                </div>
            </div>
        </section >
    )
}