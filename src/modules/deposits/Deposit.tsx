import type React from 'react';
import Header from '../../components/common/Header';
import type { DepositType } from './types/deposits';

export default function Deposit({ children, type }: {children: React.ReactNode, type: DepositType}) {
    return (
        <div className="min-h-screen bg-bg-primary">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {/* Page Header */}
                <section className="mb-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
                        {type}{' '}
                        <span className="text-secondary-main">
                            Projections
                        </span>
                    </h1>
                    <p className="text-lg text-text-secondary">
                        {
                            `Calculate and analyze your ${type} returns with detailed year-wise breakdowns.`
                        }
                    </p>
                </section>

                {/* Form Section */}
                <section className="mb-12">
                    {children}
                </section>
            </main>
        </div>
    );
}
