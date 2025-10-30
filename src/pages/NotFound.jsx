// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-outer py-20 text-center">
      <h1 className="text-3xl font-semibold">404 — Page not found</h1>
      <p className="mt-2 text-gray-600">The page you’re looking for doesn’t exist or moved.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-full border px-5 py-2 text-sm hover:bg-gray-50"
      >
        Go Home
      </Link>
    </div>
  );
}
