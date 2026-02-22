import moment from "moment";
import type { MutualFundScheme } from "../types/mutual-funds";
import Alert from "../../../components/common/Alert";

export default function SchemeNAV({ scheme }: { scheme: MutualFundScheme }) {
    const navValue = scheme.nav ? parseFloat(scheme.nav).toFixed(2) : 'N/A';
    const latestNavDate = moment(scheme.date, 'DD-MM-YYYY')

    const isClosed = latestNavDate.isBefore(moment().subtract(1, 'week'))
    const lastNavTimePeriod = latestNavDate.diff(moment(), 'weeks')
    return (
        <div className="flex flex-col items-end lg:mt-0 border bg-linear-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50 rounded-lg p-1  md:min-w-48">
            <label
                className="text-lg font-bold text-secondary-main flex items-center gap-2"
            >
                ₹{navValue} {
                    isClosed && (
                        <label className='text-accent-red relative group'>
                            <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <span className="absolute hidden group-hover:flex w-100 right-2 top-0 min-w-2">
                                <Alert type='warning'
                                    autoCloseDuration={0}
                                    showCloseIcon={false}
                                    message={`Latest NAV available is ${Math.abs(lastNavTimePeriod)} weeks old. Please verify if scheme is still active.`}
                                >
                                </Alert>
                            </span>
                        </label>
                    )
                }
            </label>
            {scheme.date && (
                <p
                    className="text-xs font-bold text-secondary-main"
                >
                    As of {scheme.date}

                </p>
            )}
        </div>
    )
}