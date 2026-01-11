import PPFForm from './components/PPFForm';
import Header from '../../components/common/Header';

const PPF = () => {


    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Page Header */}
                <section className="mb-12">
                    <h1 
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        PPF{' '}
                        <span style={{ color: 'var(--color-secondary-main)' }}>
                            Projections
                        </span>
                    </h1>
                    <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Calculate and analyze your Public Provident Fund returns with detailed year-wise breakdowns.
                    </p>
                </section>

                {/* Form Section */}
                <section className="mb-12">
                    <PPFForm />
                </section>
            </main>
        </div>
    );
};

export default PPF;