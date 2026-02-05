import Header from '../components/common/Header';

export default function PrivacyNotice() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-bg-secondary border border-border-main rounded-lg p-8">

                    <h1 className="text-4xl font-bold text-text-primary mb-2">Privacy Notice</h1>
                    <p className="text-text-secondary text-sm mb-8">Last Updated: January 2026</p>

                    <div className="space-y-8 text-text-primary">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Important Notice</h2>
                            <p className="text-text-secondary leading-relaxed">
                                fin2ools is a <strong>hobby project</strong> created for personal use and purposes.
                                This notice outlines our approach to your privacy and data handling.
                            </p>
                        </section>

                        {/* Data Collection */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Data Collection & Storage</h2>
                            <div className="bg-bg-primary border border-border-main rounded p-4 mb-4">
                                <p className="text-text-secondary leading-relaxed">
                                    <strong className="text-text-primary">✓ Your info you capture while using the tool, is stored locally in your browser only.</strong>
                                </p>
                            </div>
                            <ul className="space-y-3 text-text-secondary leading-relaxed">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-3 mt-1">✓</span>
                                    <span>Any info you enter related to FD, PPF is not stored anywhere. Info you add related to Mutual Funds is stored exclusively in your browser's local storage</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-3 mt-1">✓</span>
                                    <span>No data is transmitted to any server or external service</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-3 mt-1">✓</span>
                                    <span>Your data is never shared with third parties</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-3 mt-1">✓</span>
                                    <span>Clearing your browser cache will delete all stored data</span>
                                </li>
                            </ul>
                        </section>

                        {/* Data Usage */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">What We Do Collect</h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                The application does not collect any personal information:
                            </p>
                            <ul className="space-y-2 text-text-secondary leading-relaxed">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span>The Mutual fund you add to My-Funds is stored in your browser's local storage. The same is in no way shared with any other service or a server.</span>
                                </li>
                            </ul>
                        </section>

                        {/* External APIs */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">External Data Sources</h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                This application uses publicly available APIs to fetch financial data:
                            </p>
                            <ul className="space-y-2 text-text-secondary leading-relaxed">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">Mutual Fund Data:</strong> Retrieved from public mutual fund NAV APIs. These calls are made directly from your browser.</span>
                                </li>
                            </ul>
                            <p className="text-text-secondary leading-relaxed mt-4 text-sm italic">
                                When you request fund data, your browser makes a direct API call. Please refer to the respective API provider's privacy policy for their data handling practices.
                            </p>
                        </section>

                        {/* Security */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Security</h2>
                            <p className="text-text-secondary leading-relaxed">
                                Since all data is stored locally in your browser, the security of your information depends on your device's security.
                                We recommend:
                            </p>
                            <ul className="space-y-2 text-text-secondary leading-relaxed mt-4">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span>Keep your browser and operating system up to date</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span>Use a secure and updated browser</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span>Don't share access to your device with untrusted individuals</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span>Regularly clear your browser data if using shared devices</span>
                                </li>
                            </ul>
                        </section>

                        {/* Disclaimer */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Disclaimer & Liability</h2>
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded p-4 mb-4">
                                <p className="text-text-primary font-semibold mb-2">⚠️ Important Disclaimer</p>
                                <p className="text-text-secondary leading-relaxed">
                                    fin2ools is provided "as is" for educational and personal use only. The developer is <strong>not responsible</strong> for:
                                </p>
                            </div>
                            <ul className="space-y-2 text-text-secondary leading-relaxed">
                                <li className="flex items-start">
                                    <span className="text-orange-500 mr-3 mt-1">⚠</span>
                                    <span>Any financial losses or incorrect calculations</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-orange-500 mr-3 mt-1">⚠</span>
                                    <span>Accuracy of mutual fund data or historical NAV values</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-orange-500 mr-3 mt-1">⚠</span>
                                    <span>Unauthorized access to your data or device</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-orange-500 mr-3 mt-1">⚠</span>
                                    <span>Loss of data due to browser cache clearing or device issues</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-orange-500 mr-3 mt-1">⚠</span>
                                    <span>Any damages, direct or indirect, arising from the use of this application</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-orange-500 mr-3 mt-1">⚠</span>
                                    <span>Investment decisions made based on this tool's output</span>
                                </li>
                            </ul>
                            <p className="text-text-secondary leading-relaxed mt-4 text-sm">
                                This is a hobby project. Always verify calculations independently and consult with professional financial advisors before making investment decisions.
                            </p>
                        </section>

                        {/* Changes to This Notice */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Changes to This Notice</h2>
                            <p className="text-text-secondary leading-relaxed">
                                We may update this Privacy Notice periodically. Continued use of the application constitutes acceptance of any changes.
                                We encourage you to review this notice occasionally.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Data Sources & Attribution</h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                This application uses publicly available APIs to fetch financial data:
                            </p>
                            <div className="bg-bg-primary border border-border-main rounded p-4 mb-4">
                                <p className="text-text-secondary mb-2">
                                    <strong className="text-text-primary">Mutual Fund NAV Data:</strong> Sourced from{' '}
                                    <a href="https://www.mfapi.in" target="_blank" rel="noopener noreferrer" className="text-primary-main hover:text-primary-dark underline font-medium">
                                        MFapi.in
                                    </a>
                                </p>
                                <p className="text-text-secondary text-sm">
                                    MFapi.in is a public API that provides access to Indian mutual fund data. Your browser makes direct API calls to fetch NAV values.
                                    For their privacy practices, please visit their website.
                                </p>
                            </div>
                            <div className="bg-bg-primary border border-border-main rounded p-4 mb-4">
                                <p className="text-text-secondary mb-2">
                                    <strong className="text-text-primary">Mutual Fund Scheme Details:</strong> Sourced from{' '}
                                    <a href="https://mf.captnemo.in/" target="_blank" rel="noopener noreferrer" className="text-primary-main hover:text-primary-dark underline font-medium">
                                        https://mf.captnemo.in/
                                    </a>
                                </p>
                                <p className="text-text-secondary text-sm">
                                    https://mf.captnemo.in/ is a public API that provides access to Indian mutual fund data. Your browser makes direct API calls to fetch NAV values.
                                    For their privacy practices, please visit their website.
                                </p>
                            </div>
                        </section>

                        {/* Credits */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Credits & Acknowledgments</h2>
                            <p className="text-text-secondary leading-relaxed mb-4">
                                fin2ools is built with:
                            </p>
                            <ul className="space-y-2 text-text-secondary leading-relaxed">
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">React</strong> - A JavaScript library for building user interfaces</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">Tailwind CSS</strong> - A utility-first CSS framework</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">Chart.js</strong> - A simple yet flexible JavaScript charting library</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">Vite</strong> - A next generation frontend build tool</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">Zustand</strong> - A small, fast and scalable state management solution</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">Moment.js</strong> - A JavaScript library for parsing, validating, manipulating, and formatting dates</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-blue-500 mr-3 mt-1">•</span>
                                    <span><strong className="text-text-primary">MFapi.in</strong> - Mutual Fund NAV data is sourced from <a href="https://www.mfapi.in" target="_blank" rel="noopener noreferrer" className="text-primary-main hover:text-primary-dark underline">MFapi.in</a>.
                                        This is a public API provided for accessing Indian mutual fund data.</span>
                                </li>
                            </ul>
                            <p className="text-text-secondary leading-relaxed mt-4 text-sm">
                                Special thanks to the open-source community for creating and maintaining these excellent tools and libraries.
                            </p>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 text-text-primary">Questions?</h2>
                            <p className="text-text-secondary leading-relaxed">
                                This is a hobby project maintained by a single developer. If you have questions or concerns about this Privacy Notice,
                                please refer to the project repository or contact information if available.
                            </p>
                        </section>

                        {/* Final Confirmation */}
                        <section className="bg-bg-primary border border-border-main rounded p-4">
                            <p className="text-text-secondary text-sm leading-relaxed">
                                <strong className="text-text-primary">By using fin2ools, you acknowledge and agree to the terms outlined in this Privacy Notice.</strong>
                                If you do not agree with these terms, please discontinue use of the application.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
