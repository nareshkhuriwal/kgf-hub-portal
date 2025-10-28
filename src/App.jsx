import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { CartProvider } from "./context/CartContext";
import MiniCartDrawer from "./components/MiniCartDrawer";

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-screen">
        <Header />
        <main className="container-outer py-10">
          <Outlet />
        </main>

        {/* mini-cart lives at root so it’s global */}
        <MiniCartDrawer />

        <Footer siteName="KGF Hub" size="compact" />
      </div>
    </CartProvider>
  );
}
