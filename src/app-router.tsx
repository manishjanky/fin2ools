
import { lazy, Suspense, } from 'react';
import { Navigate, Outlet, ScrollRestoration, createBrowserRouter } from 'react-router';
import Home from './modules/Home';
import './App.css';
import Loader from './components/common/Loader';
import Footer from './components/common/Footer';
import AlertContainer from './components/common/AlertContainer';

// Lazy load FD and Mutual Funds pages for code splitting
const FD = lazy(() => import('./modules/fd/FD'));
const MutualFunds = lazy(() => import('./modules/mutual-funds/MutualFunds'));
const SchemeDetails = lazy(() => import('./modules/mutual-funds/SchemeDetails'));
const MyFunds = lazy(() => import('./modules/mutual-funds/MyFunds'));
const FundInvestmentDetails = lazy(() => import('./modules/mutual-funds/components/FundInvestmentDetails'));
const PPF = lazy(() => import('./modules/ppf/PPF'));

const Layout = () => {
    return (
        <>
            <ScrollRestoration />
            <AlertContainer />
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
                path: "fd",
                element: (
                    <Suspense fallback={<Loader fullHeight={true}/>}>
                        <FD />
                    </Suspense>
                ),
            },
            {
                path: "mutual-funds",
                children: [
                    {
                        index: true,
                        element: (
                            <Suspense fallback={<Loader fullHeight={true}/>}>
                                <MutualFunds />
                            </Suspense>
                        ),
                    },
                    {
                        path: "explore-funds",
                        element: (
                            <Suspense fallback={<Loader fullHeight={true}/>}>
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
                                    <Suspense fallback={<Loader fullHeight={true}/>}>
                                        <MyFunds />
                                    </Suspense>
                                ),
                            },
                            {
                                path: "investment/:schemeCode",
                                element: (
                                    <Suspense fallback={<Loader fullHeight={true}/>}>
                                        <FundInvestmentDetails />
                                    </Suspense>
                                ),
                            },
                        ],
                    },
                    {
                        path: "scheme/:schemeCode",
                        element: (
                            <Suspense fallback={<Loader fullHeight={true}/>}>
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