
import { lazy, Suspense, } from 'react';
import { Navigate, Outlet, ScrollRestoration, createBrowserRouter } from 'react-router';
import Home from './modules/Home';
import './App.css';
import Loader from './components/common/Loader';
import Footer from './components/common/Footer';
import AlertContainer from './components/common/AlertContainer';
import { PrivacyModal } from './components/common/PrivacyModal';

// Lazy load pages
const FD = lazy(() => import('./modules/deposits/FD'));
const MutualFunds = lazy(() => import('./modules/mutual-funds/MutualFunds'));
const SchemeDetails = lazy(() => import('./modules/mutual-funds/SchemeDetails'));
const MyFunds = lazy(() => import('./modules/mutual-funds/MyFunds'));
const Watchlist = lazy(() => import('./modules/mutual-funds/Watchlist'));
const FundInvestmentDetails = lazy(() => import('./modules/mutual-funds/components/FundInvestmentDetails'));
const PPF = lazy(() => import('./modules/ppf/PPF'));
const PrivacyNotice = lazy(() => import('./modules/PrivacyNotice'));
const RD = lazy(() => import('./modules/deposits/RD'))

const Layout = () => {
    return (
        <>
            <ScrollRestoration />
            <AlertContainer />
            <PrivacyModal />
            <Outlet />
            <Footer />
        </>
    );
}


const routes = [
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "home",
                element: <Home />,
            },
            {
                path: "deposits",
                children: [
                    {
                        path: "fd",
                        element: (
                            <Suspense fallback={<Loader fullHeight={true} />}>
                                <FD />
                            </Suspense>
                        ),
                    }, {
                        path: "rd",
                        element: (
                            <Suspense fallback={<Loader fullHeight={true} />}>
                                <RD />
                            </Suspense>
                        ),
                    }
                ]
            },
            {
                path: "mutual-funds",
                children: [
                    {
                        index: true,
                        element: (
                            <Suspense fallback={<Loader fullHeight={true} />}>
                                <MutualFunds />
                            </Suspense>
                        ),
                    },
                    {
                        path: "explore-funds",
                        element: (
                            <Suspense fallback={<Loader fullHeight={true} />}>
                                <MutualFunds />
                            </Suspense>
                        ),
                    },
                    {
                        path: "my-funds",
                        children: [
                            {
                                index: true,
                                element: (
                                    <Suspense fallback={<Loader fullHeight={true} />}>
                                        <MyFunds />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "investment/:schemeCode",
                                element: (
                                    <Suspense fallback={<Loader fullHeight={true} />}>
                                        <FundInvestmentDetails />
                                    </Suspense>
                                ),
                            },
                        ],
                    },
                    {
                        path: "watchlist",
                        element: (
                            <Suspense fallback={<Loader fullHeight={true} />}>
                                <Watchlist />
                            </Suspense>
                        ),
                    },
                    {
                        path: "scheme/:schemeCode",
                        element: (
                            <Suspense fallback={<Loader fullHeight={true} />}>
                                <SchemeDetails />
                            </Suspense>
                        ),
                    },
                ],
            }, {
                path: "ppf",
                element: (
                    <Suspense fallback={<Loader fullHeight={true} />}>
                        <PPF />
                    </Suspense>
                ),
            }, {
                path: "privacy",
                element: (
                    <Suspense fallback={<Loader fullHeight={true} />}>
                        <PrivacyNotice />
                    </Suspense>
                ),
            }
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
];

const router = createBrowserRouter(routes);
export default router;