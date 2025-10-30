// src/components/filters/MobileFiltersSheet.jsx
import React from "react";
import SidebarFilters from "./SidebarFilters";

export default function MobileFiltersSheet({ open, onClose, ...props }) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[90] bg-black/30 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-[100] max-h-[85vh] transform rounded-t-2xl bg-white p-4 shadow-xl transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Filters</div>
          <button onClick={onClose} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50">Close</button>
        </div>
        {/* Reuse the same component; it’s responsive */}
        <div className="overflow-y-auto">
          <SidebarFilters {...props} />
        </div>
      </div>
    </>
  );
}
