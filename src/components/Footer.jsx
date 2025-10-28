import { Link } from "react-router-dom";

export default function Footer({ siteName = "KGF Hub", size = "compact" }) {
  const year = new Date().getFullYear();
  const isCompact = size === "compact";

  const cols = [
    { heading: "Company", items: [{ label: "About", to: "#" }, { label: "Careers", to: "#" }, { label: "Press", to: "#" }] },
    { heading: "Shop",    items: [{ label: "Products", to: "/products" }, { label: "Services", to: "/services" }, { label: "Offers", to: "#" }] },
    { heading: "Support", items: [{ label: "Help Center", to: "#" }, { label: "Contact", to: "#" }, { label: "Shipping & Returns", to: "#" }] },
    { heading: "Legal",   items: [{ label: "Privacy Policy", to: "#" }, { label: "Terms of Service", to: "#" }, { label: "Refund Policy", to: "#" }] },
  ];

  function onNewsletter(e) { e.preventDefault(); }

  return (
    <footer className="mt-10 border-top bg-white border-t">
      {/* Top band (smaller paddings, smaller text) */}
      <div className={`container-outer ${isCompact ? "py-6" : "py-12"}`}>
        <div className={`grid ${isCompact ? "gap-6 md:grid-cols-3" : "gap-10 md:grid-cols-3"}`}>
          {/* Brand + short copy (newsletter hidden in compact mode) */}
          <div>
            <Link to="/" className={`${isCompact ? "text-lg" : "text-xl"} font-extrabold tracking-tight`}>
              KGF <span className="text-brand-600">Hub</span>
            </Link>
            <p className={`${isCompact ? "mt-2 text-xs" : "mt-3 text-sm"} text-gray-600`}>
              Your one-stop destination for quality products and on-demand services.
            </p>

            {!isCompact && (
              <form onSubmit={onNewsletter} className="mt-5 flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="Email for updates"
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <button className="btn-primary">Subscribe</button>
              </form>
            )}
          </div>

          {/* Links */}
          <div className="md:col-span-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cols.map((col) => (
              <nav key={col.heading}>
                <h4 className={`${isCompact ? "text-xs" : "text-sm"} font-semibold text-gray-900`}>{col.heading}</h4>
                <ul className={`mt-2 space-y-1 ${isCompact ? "text-xs" : "text-sm"} text-gray-600`}>
                  {col.items.map((it) => (
                    <li key={it.label}>
                      <Link to={it.to} className="hover:text-gray-900">
                        {it.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar (shorter) */}
      <div className="border-t">
        <div className={`container-outer ${isCompact ? "py-3 text-xs gap-2" : "py-6 text-sm gap-3"} flex flex-col items-center justify-between md:flex-row text-gray-500`}>
          <div>© {year} {siteName}. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span className={`${isCompact ? "badge-sm" : "badge"}`}>India (EN)</span>
            <span className={`${isCompact ? "badge-sm" : "badge"}`}>₹ INR</span>
            <div className="flex items-center gap-2">
              <span className={`${isCompact ? "badge-sm" : "badge"}`}>UPI</span>
              <span className={`${isCompact ? "badge-sm" : "badge"}`}>Visa</span>
              <span className={`${isCompact ? "badge-sm" : "badge"}`}>Mastercard</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
