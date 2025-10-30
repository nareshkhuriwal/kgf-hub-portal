// src/layouts/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import MiniCartDrawer from "../components/MiniCartDrawer.jsx";
import { CartProvider } from "../context/CartContext.jsx";

/**
 * App shell for public pages.
 * - Wraps the app in CartProvider
 * - Renders Header, page Outlet, Footer
 * - Mounts MiniCartDrawer once at root so it works from anywhere
 */
export default function PublicLayout() {
  return (
    <CartProvider>
      {/* Skip link for a11y */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:shadow"
      >
        Skip to content
      </a>

      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Header />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>

      {/* Mini cart drawer lives at root */}
      <MiniCartDrawer />
    </CartProvider>
  );
}
