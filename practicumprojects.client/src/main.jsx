import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import MainPage from './components/MainPage.jsx'
import SignInPage from './components/SignIn.jsx'
import ErrorPage from './components/ErrorPage.jsx'
import App from './App.jsx'

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainPage />,
    },
    {
        path: "signin",
        element: <SignInPage />,
    },
    {
        path: "dashboard",
        element: (
                <App />
        ),
    },
    {
        path: "*",
        element: <MainPage />,
    },
]);

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
