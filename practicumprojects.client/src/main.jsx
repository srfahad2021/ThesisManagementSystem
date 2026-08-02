import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import LandingPage from './components/LandingPage.jsx'
import SignInPage from './components/SignIn.jsx'
import ErrorPage from './components/ErrorPage.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import App from './App.jsx'

const router = createBrowserRouter([
    {
        path: "/",
        element: <LandingPage />,
    },
    {
        path: "signin",
        element: <SignInPage />,
    },
    {
        path: "dashboard",
        element: (
            <ProtectedRoute>
                <App />
            </ProtectedRoute>
        ),
    },
    {
        path: "*",
        element: <LandingPage />,
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);