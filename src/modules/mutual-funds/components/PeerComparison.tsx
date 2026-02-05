import type { CompareFunds } from "../types/mutual-funds";

export default function PeerComparison({ peers }: { peers: CompareFunds[] }) {
    return (
        <section
            className="rounded-lg p-6 bg-bg-secondary border border-border-light"
        >
            <table className="table-auto w-full">
                <thead className="border border-border-light rounded-lg bg-bg-primary">
                    <tr>
                        <th className="p-2">Scheme Name</th>
                        <th className="p-2">1yr</th>
                        <th className="p-2">3yr</th>
                        <th className="p-2">5yr</th>
                        <th className="p-2">AUM</th>
                        <th className="p-2">TER</th>
                    </tr>
                </thead>
                <tbody>
                    {peers.map((peer, index) => (
                        <tr key={index}>
                            <td className="border border-border-light p-2">{peer.shortName}</td>
                            <td className="border border-border-light p-2">{peer['1y']}%</td>
                            <td className="border border-border-light p-2">{peer['3y']}%</td>
                            <td className="border border-border-light p-2">{peer['5y']}%</td>
                            <td className="border border-border-light p-2">₹{peer.aum} cr</td>
                            <td className="border border-border-light p-2">{peer.expenseRatio}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </section>
    );
}