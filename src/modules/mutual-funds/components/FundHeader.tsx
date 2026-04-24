import { useNavigate } from "react-router";
import type { MutualFundScheme } from "../types/mutual-funds";
import SchemeNAV from "./SchemeNAV";
import FundActionMenu from "./FundActionMenu";

interface FundHeaderProps {
    scheme: MutualFundScheme;
    isInvested?: boolean;
    clickableTitle?: boolean;
}

export default function FundHeader({
    scheme,
    clickableTitle = false,
}: FundHeaderProps) {
    const navigate = useNavigate();

    const handleTitleClick = () => {
        if (clickableTitle) {
            navigate(`/mutual-funds/scheme/${scheme.schemeCode}`);
        }
    };

    return (
        <section className="mb-6 border border-primary-lighter/30 rounded-lg p-2.5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                    <div className="flex items-start gap-2 mb-1">
                        <h1 
                            onClick={handleTitleClick}
                            className={`text-lg font-bold text-text-primary ${clickableTitle ? 'cursor-pointer hover:text-primary-main transition' : ''}`}
                        >
                            {scheme.schemeName}
                        </h1>
                        {clickableTitle && (
                            <svg 
                                onClick={handleTitleClick}
                                className="w-5 h-5 text-secondary-main hover:text-primary-main transition cursor-pointer shrink-0 mt-1"
                                fill="none" 
                                viewBox="0 0 24 24" 
                                strokeWidth="2" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        )}
                    </div>

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
                <div className="flex flex-row-reverse justify-between items-center lg:flex-col lg:items-end">
                    <SchemeNAV scheme={scheme} />
                    <FundActionMenu
                        scheme={scheme}
                    />
                </div>
            </div>
        </section>
    );
}