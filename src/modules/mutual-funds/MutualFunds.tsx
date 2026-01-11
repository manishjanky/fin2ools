import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Header from '../../components/common/Header';
import MutualFundList from './components/MutualFundList';
import { useInvestmentStore } from './store';

export default function MutualFunds() {
  const navigate = useNavigate();
  const { loadInvestments, hasInvestments } = useInvestmentStore();

  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);

  useEffect(() => {
    // If user has investments, redirect to my-funds
    if (hasInvestments) {
      navigate('/mutual-funds/my-funds');
    }
  }, [hasInvestments, navigate]);

  const getBackgroundStyle = () => {
    return {
      background: `linear-gradient(135deg, var(--color-bg-secondary), var(--color-bg-tertiary))`,
    };
  };

  return (
    <div className="min-h-screen" style={getBackgroundStyle()}>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <section className="mb-12">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Mutual{' '}
            <span style={{ color: 'var(--color-secondary-main)' }}>
              Funds
            </span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Explore and track mutual fund schemes with latest NAV data.
          </p>
        </section>

        {/* Navigation Tabs */}
        {hasInvestments && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => navigate('/mutual-funds/my-funds')}
              className="px-6 py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: 'var(--color-primary-main)',
                color: 'var(--color-text-inverse)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-main)';
              }}
            >
              My Funds
            </button>
            <button
              onClick={() => navigate('/mutual-funds/explore-funds')}
              className="px-6 py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-secondary)',
                border: `1px solid var(--color-border-main)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
              }}
            >
              Explore More
            </button>
          </div>
        )}

        <section>
          <MutualFundList />
        </section>
      </main>
    </div>
  );
}
