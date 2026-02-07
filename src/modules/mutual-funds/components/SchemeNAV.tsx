import type { MutualFundScheme } from "../types/mutual-funds";

export default function SchemeNAV({ scheme }: { scheme: MutualFundScheme }) {
    const navValue = scheme.nav ? parseFloat(scheme.nav).toFixed(2) : 'N/A';

    return (
        <div className="flex flex-col items-end mt-1 lg:mt-0 border bg-linear-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 rounded-lg p-1  md:min-w-48">
            <span
                className="text-xl font-bold text-secondary-main"
            >
                ₹{navValue}
            </span>
            {scheme.date && (
                <p
                    className="text-xs mt-1 font-bold text-secondary-main"
                >
                    As of {scheme.date}
                </p>
            )}
        </div>
    )
}