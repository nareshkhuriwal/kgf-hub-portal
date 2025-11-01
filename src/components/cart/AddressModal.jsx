import { useEffect, useMemo, useRef, useState } from "react";

/**
 * AddressModal (UI-only)
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - initialAddress?: Address (prefill form)
 *  - savedAddresses?: Address[] (optional, for left list)
 *  - onSelect: (addr: Address) => void   // called when user selects/saves an address
 *
 * Address shape:
 * { id: string, name: string, phone?: string, line1: string, city: string, state: string, pincode: string }
 */
export default function AddressModal({ open, onClose, initialAddress, savedAddresses = [], onSelect }) {
    const [tab, setTab] = useState(savedAddresses?.length ? "list" : "form"); // 'list' | 'form'
    const [form, setForm] = useState(() => ({
        id: initialAddress?.id || `addr-${Date.now()}`,
        name: initialAddress?.name || "",
        phone: initialAddress?.phone || "",
        line1: initialAddress?.line1 || "",
        city: initialAddress?.city || "",
        state: initialAddress?.state || "",
        pincode: initialAddress?.pincode || "",
    }));

    const [errors, setErrors] = useState({});
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        setErrors({});
        setTab(savedAddresses?.length ? "list" : "form");
    }, [open, savedAddresses]);

    const isValid = useMemo(() => {
        const e = {};
        if (!form.name || form.name.trim().length < 2) e.name = "Enter a valid name";
        if (form.phone && !/^\d{10}$/.test(form.phone.trim())) e.phone = "Enter 10-digit phone";
        if (!form.line1 || form.line1.trim().length < 3) e.line1 = "Enter address line";
        if (!form.city || form.city.trim().length < 2) e.city = "Enter city";
        if (!form.state || form.state.trim().length < 2) e.state = "Enter state";
        // Allow 5 or 6 digits (US ZIP / IN PIN)
        if (!/^\d{5,6}$/.test((form.pincode || "").trim())) e.pincode = "Enter 5 or 6 digit postal code";
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [form]);

    function update(k, v) {
        setForm((f) => ({ ...f, [k]: v }));
    }

    function handleSave() {
        if (!isValid) return;
        onSelect?.({
            id: form.id,
            name: form.name.trim(),
            phone: form.phone?.trim(),
            line1: form.line1.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            pincode: form.pincode.trim(),
        });
        onClose?.();
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className="relative z-[101] w-[92vw] max-w-3xl rounded-2xl bg-white p-0 shadow-xl"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="text-lg font-semibold">Choose delivery address</div>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-2 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b px-6 pt-3">
                    <button
                        onClick={() => setTab("list")}
                        className={[
                            "rounded-t-md px-3 py-2 text-sm",
                            tab === "list" ? "border-b-2 border-gray-900 font-medium" : "text-gray-600",
                        ].join(" ")}
                    >
                        Saved
                    </button>
                    <button
                        onClick={() => setTab("form")}
                        className={[
                            "rounded-t-md px-3 py-2 text-sm",
                            tab === "form" ? "border-b-2 border-gray-900 font-medium" : "text-gray-600",
                        ].join(" ")}
                    >
                        Add new
                    </button>
                </div>

                {/* Body */}
                <div className="grid gap-6 p-6 md:grid-cols-12">
                    {/* Left: Saved list */}
                    <div className="md:col-span-5">
                        {tab === "list" ? (
                            savedAddresses?.length ? (
                                <div className="space-y-3">
                                    {savedAddresses.map((a) => (
                                        <label
                                            key={a.id}
                                            className="flex cursor-pointer items-start justify-between rounded-xl border p-3 hover:border-gray-900"
                                            onClick={() => {
                                                onSelect?.(a);
                                                onClose?.();
                                            }}
                                        >
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {a.name} <span className="text-gray-500">({a.pincode})</span>
                                                </div>
                                                <div className="text-gray-600">
                                                    {a.line1}, {a.city}, {a.state}
                                                </div>
                                                {a.phone ? <div className="text-gray-500">+91 {a.phone}</div> : null}
                                            </div>
                                            <span className="rounded-full border px-3 py-1 text-xs">Deliver here</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border p-4 text-sm text-gray-600">
                                    No saved addresses. Add one on the right.
                                </div>
                            )
                        ) : (
                            <div className="rounded-xl border p-4 text-sm text-gray-600">
                                You’re adding a new address. Fill the form.
                            </div>
                        )}
                    </div>

                    {/* Right: Form */}
                    <div className="md:col-span-7">
                        <div className="grid gap-3 md:grid-cols-2">
                            <TextField
                                label="Full name"
                                value={form.name}
                                onChange={(v) => update("name", v)}
                                error={errors.name}
                            />
                            <TextField
                                label="Phone (optional)"
                                value={form.phone}
                                onChange={(v) => update("phone", v)}
                                error={errors.phone}
                                maxLength={10}
                                inputMode="numeric"
                            />
                            <TextField
                                className="md:col-span-2"
                                label="Address line"
                                value={form.line1}
                                onChange={(v) => update("line1", v)}
                                error={errors.line1}
                            />
                            <TextField
                                label="City"
                                value={form.city}
                                onChange={(v) => update("city", v)}
                                error={errors.city}
                            />
                            <TextField
                                label="State"
                                value={form.state}
                                onChange={(v) => update("state", v)}
                                error={errors.state}
                            />
                            <TextField
                                label="Pincode / ZIP"
                                value={form.pincode}
                                onChange={(v) => update("pincode", v)}
                                error={errors.pincode}
                                maxLength={6}
                                inputMode="numeric"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-3">
                            <button className="rounded-lg border px-4 py-2 hover:bg-gray-50" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
                                onClick={handleSave}
                                disabled={!isValid}
                            >
                                Save & Use
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TextField({ label, value, onChange, error, className = "", ...rest }) {
    return (
        <label className={`block ${className}`}>
            <div className="mb-1 text-xs font-medium text-gray-600">{label}</div>
            <input
                className={[
                    "w-full rounded-lg border px-3 py-2 outline-none",
                    error ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-gray-400",
                ].join(" ")}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                {...rest}
            />
            {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
        </label>
    );
}
