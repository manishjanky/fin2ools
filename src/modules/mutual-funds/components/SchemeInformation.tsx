import type { MutualFundSchemeDetails } from "../types/mutual-funds";

export default function SchemeInformation({ details }: { details: MutualFundSchemeDetails }) {
    return (
        <section
            className="rounded-lg p-6 bg-bg-secondary border border-border-light"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {details.category && (<div>
                    <p
                        className="text-sm mb-2 text-text-secondary"
                    >
                        Asset Category
                    </p>
                    <p
                        className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                    >
                        {details.category}
                    </p>
                </div>)}
                {
                    details.aum && (
                        <div>
                            <p
                                className="text-sm mb-2 text-text-secondary"
                            >
                                Assets Under Management (AUM)
                            </p>
                            <p
                                className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                            >
                                ₹{details.aum} cr
                            </p>
                        </div>
                    )
                }

                {details.expenseRatio && (
                    <div>
                        <p
                            className="text-sm mb-2 text-text-secondary"
                        >
                            Expense Ratio:
                        </p>
                        <p
                            className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                        >
                            {details.expenseRatio}%
                        </p>
                    </div>
                )}
                {details.crisilRating && (
                    <div>
                        <p
                            className="text-sm mb-2 text-text-secondary"
                        >
                            Risk Factor:
                        </p>
                        <p
                            className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                        >
                            {details.crisilRating}
                        </p>
                    </div>
                )}

                {
                    details.lumpMin && (
                        <div>
                            <p
                                className="text-sm mb-2 text-text-secondary"
                            >
                                Minimum Lumpsum Investment:
                            </p>
                            <p
                                className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                            >
                                ₹{details.lumpMin.toLocaleString()}
                            </p>
                        </div>
                    )
                }

                {
                    details.sipMin && (
                        <div>
                            <p
                                className="text-sm mb-2 text-text-secondary"
                            >
                                Minimum SIP Investment:
                            </p>
                            <p
                                className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                            >
                                ₹{details.sipMin.toLocaleString()}
                            </p>
                        </div>
                    )
                }
                {
                    details.lockInPeriod !== undefined && (
                        <div>
                            <p
                                className="text-sm mb-2 text-text-secondary"
                            >
                                Lock-in Period:
                            </p>
                            <p
                                className="font-mono p-3 rounded text-text-primary bg-bg-primary border border-border-light"
                            >
                                {details.lockInPeriod} months
                            </p>
                        </div>
                    )
                }
            </div>

        </section>

    );
}