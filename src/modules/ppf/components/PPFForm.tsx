import { Fragment, useState } from 'react';

const PPFForm = () => {
    const [startYear, setStartYear] = useState(new Date().getFullYear() - 1);
    // const [currentYear] = useState(new Date().getFullYear());
    const [interestRate, setInterestRate] = useState(7.25);
   // const [contributions, setContributions] = useState([]);
    const [contribInput, setContribInput] = useState('');
    const [variablePastContributions, setVariablePastContributions] = useState(false);

    // const calculatePPF = () => {
    //     const allContribs = [...contributions, ...futureContribs];
    //     let balance = 0;
    //     let totalContrib = 0;
    //     let interestEarned = 0;
    //     const report = [];

    //     for (let y = startYear; y <= (showFuture ? parseInt(futureYears) : currentYear); y++) {
    //         const contribObj = allContribs.find(c => c.year === y);
    //         const contrib = contribObj ? contribObj.amount : 0;
    //         const openingBalance = balance;
    //         balance += contrib;
    //         const interest = balance * (interestRate / 100);
    //         balance += interest;

    //         if (contrib > 0) totalContrib += contrib;
    //         interestEarned += interest;

    //         report.push({
    //             year: y,
    //             openingBalance,
    //             contribution: contrib,
    //             interest,
    //             closingBalance: balance,
    //         });
    //     }
    //     return {
    //         report,
    //         totalContrib,
    //         interestEarned,
    //         maturityAmount: balance,
    //     };
    // };

    // const { report, totalContrib, interestEarned, maturityAmount } = calculatePPF();

    return (
        <div
          className="rounded-lg p-8"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            border: '1px solid var(--color-primary-lighter)',
          }}
        >
            <h2 
              className="text-2xl font-bold mb-6"
              style={{ color: 'var(--color-text-primary)' }}
            >
              PPF Calculator
            </h2>
            <form className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Start Year */}
                    <div>
                        <label
                          className="block font-medium mb-2"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Start Year
                        </label>
                        <input
                            type="number"
                            value={startYear}
                            onChange={(e) => setStartYear(parseInt(e.target.value))}
                            min="1900"
                            max={new Date().getFullYear()}
                            className="w-full rounded-lg px-4 py-2 transition border"
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-main)',
                              color: 'var(--color-text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-border-main)';
                            }}
                        />
                    </div>

                    {/* Interest Rate */}
                    <div>
                        <label
                          className="block font-medium mb-2"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Interest Rate (% per annum)
                        </label>
                        <input
                            type="number"
                            value={interestRate}
                            onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg px-4 py-2 transition border"
                            style={{
                              backgroundColor: 'var(--color-bg-secondary)',
                              borderColor: 'var(--color-border-main)',
                              color: 'var(--color-text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-border-main)';
                            }}
                        />
                    </div>

                    {
                        !variablePastContributions && <div>
                            <label
                              className="block font-medium mb-2"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Yearly Contribution
                            </label>
                            <input
                                type="number"
                                value={contribInput}
                                onChange={(e) => setContribInput(e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="Yearly Contribution Amount (₹)"
                                className="w-full rounded-lg px-4 py-2 transition border"
                                style={{
                                  backgroundColor: 'var(--color-bg-secondary)',
                                  borderColor: 'var(--color-border-main)',
                                  color: 'var(--color-text-primary)',
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--color-border-main)';
                                }}
                            />
                        </div>
                    }

                </div>

                {
                    variablePastContributions && (
                        <Fragment>
                            <h3
                              className="font-bold text-xl mb-2"
                              style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Annual Contributions
                            </h3>

                            <div className='grid md:grid-cols-2 gap-6'>
                                <div>
                                    <label
                                      className="block font-medium mb-2"
                                      style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        Year
                                    </label>
                                    <input
                                        type="number"
                                        value={contribInput}
                                        onChange={(e) => setContribInput(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        placeholder="Year"
                                        className="w-full rounded-lg px-4 py-2 transition border"
                                        style={{
                                          backgroundColor: 'var(--color-bg-secondary)',
                                          borderColor: 'var(--color-border-main)',
                                          color: 'var(--color-text-primary)',
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-border-main)';
                                        }}
                                    />
                                </div>
                                <div>
                                    <label
                                      className="block font-medium mb-2"
                                      style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        Contribution Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={contribInput}
                                        onChange={(e) => setContribInput(e.target.value)}
                                        min="0"
                                        step="0.01"
                                        placeholder="Contribution Amount (₹)"
                                        className="w-full rounded-lg px-4 py-2 transition border"
                                        style={{
                                          backgroundColor: 'var(--color-bg-secondary)',
                                          borderColor: 'var(--color-border-main)',
                                          color: 'var(--color-text-primary)',
                                        }}
                                        onFocus={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-primary-main)';
                                        }}
                                        onBlur={(e) => {
                                          e.currentTarget.style.borderColor = 'var(--color-border-main)';
                                        }}
                                    />
                                </div>
                            </div>
                        </Fragment>

                    )
                }
                <div className='block'>
                    <button
                        type="button"
                        onClick={() => setVariablePastContributions(!variablePastContributions)}
                        className="my-2 mr-2 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 text-lg"
                        style={{
                          background: 'linear-gradient(to right, var(--color-primary-main), var(--color-secondary-main))',
                          color: 'var(--color-text-inverse)',
                        }}
                    >
                        Amount contributed not same every year
                    </button>

                    <button
                        type="button"
                        className="my-2 ml-2 font-bold py-3 px-6 rounded-lg transition transform hover:scale-105 text-lg"
                        style={{
                          background: 'linear-gradient(to right, var(--color-primary-main), var(--color-secondary-main))',
                          color: 'var(--color-text-inverse)',
                        }}
                    >
                        Calculate
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PPFForm;