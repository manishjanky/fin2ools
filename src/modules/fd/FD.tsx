import Header from '../../components/common/Header';
import FDForm from './components/FDForm';

export default function FD() {
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
            FD{' '}
            <span style={{ color: 'var(--color-secondary-main)' }}>
              Projections
            </span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Calculate and analyze your Fixed Deposit returns with detailed year-wise breakdowns.
          </p>
        </section>

        {/* Form Section */}
        <section className="mb-12">
          <FDForm />
        </section>
      </main>
    </div>
  );
}
