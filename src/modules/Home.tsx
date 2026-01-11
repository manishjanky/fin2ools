import { useNavigate } from 'react-router';
import FeatureTile from '../components/common/FeatureTile';
import Header from '../components/common/Header';

export default function Home() {
  const navigate = useNavigate();



  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <section className="mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Choose Your Tool
          </h2>
          <p 
            className="text-xl max-w-2xl"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Select which financial tool you'd like to explore today.
          </p>
        </section>

        {/* Features Grid */}
        <section className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="cursor-pointer">
            <FeatureTile
              title="FD Projections"
              description="Calculate and project your Fixed Deposit returns with detailed maturity amounts and interest earnings. Compare rates from different providers."
              icon="📊"
              gradient="from-purple-500 to-blue-600"
              onClick={() => navigate('fd')}
            />
          </div>
          <div className="cursor-pointer">
            <FeatureTile
              title="Mutual Funds"
              description="Explore mutual fund options, compare returns, and analyze your portfolio performance. Make informed investment decisions."
              icon="📈"
              gradient="from-blue-500 to-cyan-600"
              onClick={() => navigate('mutual-funds')}
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
        </section>
      </main>
    </div>
  );
}

// function StatCard({ number, label }: { number: string; label: string }) {
//   return (
//     <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-6 text-center hover:border-purple-500/50 transition">
//       <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
//         {number}
//       </p>
//       <p className="text-purple-200">{label}</p>
//     </div>
//   );
// }
