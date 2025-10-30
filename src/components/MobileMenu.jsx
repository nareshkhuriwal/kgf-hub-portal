// src/components/MobileMenu.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { NAV_TABS, NAV_STRUCTURE } from "../constants/navData";

export default function MobileMenu({ onNavigate }) {
  const [openKey, setOpenKey] = useState(null);

  return (
    <div className="md:hidden border-t bg-white" role="dialog" aria-label="Mobile navigation">
      <div className="container-outer py-2">
        {NAV_TABS.map((tab) => {
          const hasChildren = Array.isArray(NAV_STRUCTURE[tab]);
          const isOpen = openKey === tab;
          return (
            <div key={tab} className="border-b last:border-b-0">
              <button
                className="flex w-full items-center justify-between py-3 text-left text-[15px] font-medium"
                onClick={() => (hasChildren ? setOpenKey(isOpen ? null : tab) : onNavigate?.())}
                aria-expanded={isOpen}
              >
                <span>{tab}</span>
                {hasChildren ? <span className="text-xl">{isOpen ? "−" : "+"}</span> : null}
              </button>
              {isOpen && hasChildren && (
                <div className="pb-3">
                  {(NAV_STRUCTURE[tab] || []).map((col) => (
                    <div key={col.heading} className="py-1">
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">{col.heading}</div>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        {col.links.map((l) => (
                          <Link
                            key={l}
                            to={`/products?cat=${encodeURIComponent(tab.toLowerCase())}&sub=${encodeURIComponent(l.toLowerCase())}`}
                            className="text-[14px] text-gray-800"
                            onClick={onNavigate}
                          >
                            {l}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!hasChildren && (
                <Link to={`/products?tab=${tab.toLowerCase()}`} className="block pb-3 text-[14px]" onClick={onNavigate}>
                  View {tab}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
