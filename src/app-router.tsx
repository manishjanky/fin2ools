
import { lazy, Suspense, } from 'react';
import { Navigate, Outlet, ScrollRestoration, createBrowserRouter } from 'react-router';
import Home from './modules/Home';
import './App.css';
import PageLoader from './components/common/PageLoader';
import Footer from './components/common/Footer';

// Lazy load FD and Mutual Funds pages for code splitting
const FD = lazy(() => import('./modules/fd/FD'));
const MutualFunds = lazy(() => import('./modules/mutual-funds/MutualFunds'));
const SchemeDetails = lazy(() => import('./modules/mutual-funds/SchemeDetails'));
const MyFunds = lazy(() => import('./modules/mutual-funds/MyFunds'));
const PPF = lazy(() => import('./modules/ppf/PPF'));

const Layout = () => {
    return (
        <>
            <ScrollRestoration />
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
                    <Suspense fallback={<PageLoader />}>
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
                            <Suspense fallback={<PageLoader />}>
                                <MutualFunds />
                            </Suspense>
                        ),
                    },
                    {
                        path: "explore-funds",
                        element: (
                            <Suspense fallback={<PageLoader />}>
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
                                    <Suspense fallback={<PageLoader />}>
                                        <MyFunds />
                                    </Suspense>
                                ),
                            },

                        ],
                    },
                    {
                        path: "scheme/:schemeCode",
                        element: (
                            <Suspense fallback={<PageLoader />}>
                                <SchemeDetails />
                            </Suspense>
                        ),
                    },
                ],
            }, {
                path: "ppf",
                element: (
                    <Suspense fallback={<PageLoader />}>
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