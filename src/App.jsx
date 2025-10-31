// src/App.jsx
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import MiniCartDrawer from "./components/MiniCartDrawer";

export default function App() {
  return (
    <CartProvider>
      {/* Make footer stick to bottom; keep header above drawers */}
      <div className="min-h-screen flex flex-col">
        <Header />

        {/* Let pages decide their own container; avoid double 'container-outer' */}
        <main className="flex-1 py-10">
          <Outlet />
        </main>

        {/* Mini-cart should sit above header; ensure higher z-index inside component or here */}
        <div className="relative z-40">
          <MiniCartDrawer />
        </div>

        <Footer siteName="KGF Hub" size="compact" />
      </div>
    </CartProvider>
  );
}
