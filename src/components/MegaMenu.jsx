// src/components/MegaMenu.jsx
import { Link } from "react-router-dom";
import { NAV_STRUCTURE, NAV_PROMOS } from "../constants/navData";

export default function MegaMenu({ activeTab, open }) {
  if (!open || !activeTab) return null;
  const cols = NAV_STRUCTURE[activeTab] || [];
  const promo = NAV_PROMOS[activeTab];

  return (
    <div
      className="absolute left-0 right-0 top-full z-20 border-b bg-white/95 backdrop-blur transition-all animate-fadein"
      role="dialog"
      aria-label={`${activeTab} menu`}
    >
      <div className="container-outer grid grid-cols-12 gap-6 py-6">
        <div className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cols.map((col, idx) => (
            <section key={idx} aria-labelledby={`head-${idx}`}>
              <h4 id={`head-${idx}`} className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                {col.heading}
              </h4>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link to={`/products?cat=${encodeURIComponent(activeTab.toLowerCase())}&sub=${encodeURIComponent(l.toLowerCase())}`} className="text-[15px] text-gray-800 hover:underline">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* promo tile */}
        <aside className="col-span-12 lg:col-span-3">
          {promo && (
            <Link to={promo.to} className="block overflow-hidden rounded-2xl border shadow-card hover:shadow-lg">
              <div className="aspect-[4/3] w-full bg-gray-100">
                {/* Replace with real images in /public/promos */}
                <img src={promo.img} alt={promo.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <div className="p-4">
                <div className="text-base font-semibold">{promo.title}</div>
                <div className="text-sm text-gray-600">{promo.cta}</div>
              </div>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
