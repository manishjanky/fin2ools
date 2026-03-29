import { useState, useRef, useEffect } from "react";
import type { MutualFundScheme } from "../types/mutual-funds";
import AddToMyFunds from "./AddToMyFunds";
import RemoveFund from "./RemoveFund";
import { useInvestmentStore } from "../store";

interface FundActionMenuProps {
    scheme: MutualFundScheme;
}

export default function FundActionMenu({
    scheme,
}: FundActionMenuProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [isInvested, setIsInvested] = useState(false);
    const { getSchemeInvestments } = useInvestmentStore();
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const invs = getSchemeInvestments(scheme.schemeCode);
        setIsInvested(!!invs.investments.length);
    }, [scheme.schemeCode]);
    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative mt-1" ref={menuRef}>
            <button
                onClick={($event) => {
                    $event.stopPropagation();
                    setShowMenu(!showMenu)
                }}
                className="flex items-center justify-center"
                title="Fund options"
                aria-label="Actions menu"
                style={{
                    padding: 0
                }}

            >
                <label className="flex flex-col gap-1 mr-1 cursor-pointer pl-1">
                    <span className="w-5 h-0.5 transition-all bg-text-primary" ></span>
                    <span className="w-5 h-0.5 transition-all bg-text-primary"></span>
                    <span className="w-5 h-0.5 transition-all bg-text-primary" ></span>
                </label>
                <span className="pr-1">Fund Options</span>
            </button>

            {showMenu && (
                <div className={` absolute bg-bg-primary mt-1 min-w-48 border border-border-light rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 lg:right-0`}>
                    <AddToMyFunds scheme={scheme}
                        label={
                            <span className="text-left w-full px-3 py-1.5 hover:bg-blue-50 dark:hover:bg-gray-700/50 transition-colors duration-150 text-primary-main font-semibold flex items-center gap-3 group"
                            >  <svg
                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-150"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                <span>Add Investment</span>
                            </span>
                        } />

                    {isInvested && (
                        <>
                            <div className="border-t border-border-dark" />
                            <RemoveFund scheme={scheme} label={
                                <span className="text-left w-full px-3 py-1.5 hover:bg-red-50 dark:hover:bg-gray-700/50 transition-colors duration-150 text-red-600 dark:text-red-400 font-semibold flex items-center gap-3 group"
                                >
                                    <svg
                                        className="w-5 h-5 group-hover:scale-110 transition-transform duration-150"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2.5}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                    <span>Remove Fund</span>
                                </span>
                            } onClose={() => setShowMenu(false)} />
                        </>
                    )}

                    {!isInvested && (
                        <div className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 italic border-t border-gray-200 dark:border-gray-700">
                            Add an investment to unlock all options
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
