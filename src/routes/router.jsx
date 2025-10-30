// src/routes/router.js
import React, { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout.jsx";

const Home = lazy(() => import("../pages/Home.jsx"));
const Services = lazy(() => import("../pages/Services.jsx"));
const Products = lazy(() => import("../pages/Products.jsx"));
const Cart = lazy(() => import("../pages/Cart.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));
const ProductDetail = lazy(() => import("../pages/ProductDetail.jsx"));

function Fallback() {
  return (
    <div className="container-outer py-16 text-center text-sm text-gray-500">
      Loading…
    </div>
  );
}

function RouteError() {
  // Optional: simple route-level error UI
  return (
    <div className="container-outer py-16 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-gray-600">Please go back or try reloading the page.</p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Suspense fallback={<Fallback />}><Home /></Suspense> },
      { path: "services", element: <Suspense fallback={<Fallback />}><Services /></Suspense> },
      { path: "products", element: <Suspense fallback={<Fallback />}><Products /></Suspense> },
      { path: "cart", element: <Suspense fallback={<Fallback />}><Cart /></Suspense> },
      { path: "product/:id", element: <Suspense fallback={<Fallback />}><ProductDetail /></Suspense> },
      // ✅ Add PDP later:
      // { path: "product/:id", element: <Suspense fallback={<Fallback />}><ProductDetail /></Suspense> },
      { path: "*", element: <Suspense fallback={<Fallback />}><NotFound /></Suspense> },
    ],
  },
]);

export default router;
