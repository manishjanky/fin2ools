import { useNavigate } from 'react-router';
import FeatureTile from '../components/common/FeatureTile';
import Header from '../components/common/Header';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <section className="mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4 text-text-primary"
          >
            Choose Your Tool
          </h2>
          <p
            className="text-xl max-w-2xl text-text-secondary"
          >
            Select which financial tool you'd like to explore today.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

          <div className="cursor-pointer">
            <FeatureTile
              title="Mutual Funds"
              description="Explore mutual fund options, compare returns, and analyze your portfolio performance. Make informed investment decisions."
              icon="📈"
              gradient="from-blue-500 to-cyan-600"
              onClick={() => navigate('mutual-funds/explore-funds')}
            />
          </div>
          <div className="cursor-pointer">
            <FeatureTile
              title="My Mutual Funds"
              description="View and analyze your mutual fund investments in one place."
              icon="📈"
              gradient="from-blue-500 to-cyan-600"
              onClick={() => navigate('mutual-funds/my-funds')}
            />
          </div>
          <div className="cursor-pointer">
            <FeatureTile
              title="Public Provident Fund"
              description="Calculate and analyze your Public Provident Fund returns with detailed year-wise breakdowns."
              icon="💰"
              gradient="from-blue-500 to-cyan-600"
              onClick={() => navigate('ppf')}
            />
          </div>
          <div className="cursor-pointer">
            <FeatureTile
              title="FD Projections"
              description="Calculate and project your Fixed Deposit returns with detailed maturity amounts and interest earnings. Compare rates from different providers."
              icon="📊"
              gradient="from-purple-500 to-blue-600"
              onClick={() => navigate('deposits/fd')}
            />
          </div>
          <div className="cursor-pointer">
            <FeatureTile
              title="RD Projections"
              description="Calculate and project your Recurring Deposit returns with detailed maturity amounts and interest earnings. Compare rates from different providers."
              icon="📊"
              gradient="from-purple-500 to-blue-600"
              onClick={() => navigate('deposits/rd')}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
