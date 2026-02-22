
import { lazy, Suspense } from 'react';
import Loader from '../../../components/common/Loader';
const MutualFundList = lazy(() => import('./MutualFundList'));


export default function MutualFunds() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <section className="mb-6">
          <h1
            className="text-2xl md:text-4xl font-bold mb-4 text-text-primary"
          >
            Mutual{' '}
            <span className="text-secondary-dark">
              Funds
            </span>
          </h1>
          <p className="text-lg text-text-secondary">
            Explore and track mutual fund schemes with latest NAV data.
          </p>
        </section>
        <section>
          <Suspense fallback={<Loader message='Loading Schemes...' />}>
            <MutualFundList />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
