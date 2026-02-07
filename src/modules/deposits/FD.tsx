import Header from '../../components/common/Header';
import FDForm from './components/FDForm';

export default function FD() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <section className="mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            FD{' '}
            <span className="text-secondary-main">
              Projections
            </span>
          </h1>
          <p className="text-lg text-text-secondary">
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
