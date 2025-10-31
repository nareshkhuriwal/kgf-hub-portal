// src/routes/router.js
import React, { lazy, Suspense, useEffect } from "react";
import { createBrowserRouter, useNavigate } from "react-router-dom";
import App from "../App.jsx"; // ← Use App as the root layout
import RequireAuth from "./RequireAuth.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Home = lazy(() => import("../pages/Home.jsx"));
const Services = lazy(() => import("../pages/Services.jsx"));
const Products = lazy(() => import("../pages/Products.jsx"));
const Cart = lazy(() => import("../pages/Cart.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));
const ProductDetail = lazy(() => import("../pages/ProductDetail.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Account = lazy(() => import("../pages/Account.jsx"));
const OrderSuccess = lazy(() => import("../pages/OrderSuccess.jsx"));

function Fallback() {
  return (
    <div className="container-outer py-16 text-center text-sm text-gray-500">
      Loading…
    </div>
  );
}

function RouteError() {
  return (
    <div className="container-outer py-16 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">Please go back or try reloading the page.</p>
    </div>
  );
}

// Logout route clears auth then redirects home
function LogoutRoute() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    logout();
    navigate("/", { replace: true });
  }, [logout, navigate]);
  return (
    <div className="container-outer py-16 text-center text-sm text-gray-500">
      Logging out…
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,            // ← Root layout is App (Header/Main/Footer)
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Suspense fallback={<Fallback />}><Home /></Suspense> },
      { path: "services", element: <Suspense fallback={<Fallback />}><Services /></Suspense> },
      { path: "products", element: <Suspense fallback={<Fallback />}><Products /></Suspense> },
      { path: "cart", element: <Suspense fallback={<Fallback />}><Cart /></Suspense> },
      { path: "product/:id", element: <Suspense fallback={<Fallback />}><ProductDetail /></Suspense> },
      { path: "order/success/:orderId", element: <Suspense fallback={<Fallback />}><OrderSuccess /></Suspense> },

      // Auth
      { path: "login", element: <Suspense fallback={<Fallback />}><Login /></Suspense> },
      {
        path: "account",
        element: (
          <RequireAuth>
            <Suspense fallback={<Fallback />}><Account /></Suspense>
          </RequireAuth>
        ),
      },
      { path: "logout", element: <LogoutRoute /> },

      { path: "*", element: <Suspense fallback={<Fallback />}><NotFound /></Suspense> },
    ],
  },
]);

export default router;
