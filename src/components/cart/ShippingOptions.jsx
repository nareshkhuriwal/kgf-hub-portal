import { useEffect, useState } from "react";
import { getShippingOptions } from "../../services/shipping";

export default function ShippingOptions({ pincode: initialPin, value, onChange }) {
  const [pincode, setPincode] = useState(initialPin || "");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialPin) handleCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheck() {
    setError("");
    const code = (pincode || "").trim();

    // ✅ Accept 5 or 6 numeric digits (US ZIP or IN PIN)
    if (!/^\d{5,6}$/.test(code)) {
      setError("Enter a valid 5 or 6 digit postal code");
      setOptions([]);
      onChange?.(null);
      return;
    }

    setLoading(true);
    try {
      const res = await getShippingOptions(code);
      setOptions(res.options || []);
      const first =
        (res.options || []).find((o) => o.id === "standard" && o.available) ||
        (res.options || []).find((o) => o.available);
      onChange?.(first || null);
    } catch {
      setError("Unable to fetch delivery options. Try again.");
      setOptions([]);
      onChange?.(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 font-medium">Delivery options</div>

      <div className="mb-3 flex gap-2">
        <input
          className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gray-400"
          placeholder="Enter pincode / ZIP"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          maxLength={6}
          inputMode="numeric"
        />
        <button
          className="rounded-lg bg-gray-900 px-4 py-2 text-white disabled:opacity-50"
          onClick={handleCheck}
          disabled={loading}
        >
          {loading ? "Checking…" : "Check"}
        </button>
      </div>

      {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((opt) => {
            const disabled = !opt.available;
            const selected = value?.id === opt.id;
            return (
              <label
                key={opt.id}
                className={[
                  "flex cursor-pointer items-start justify-between rounded-lg border p-3",
                  selected ? "border-gray-900" : "border-gray-200",
                  disabled ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    className="mt-1"
                    disabled={disabled}
                    checked={selected}
                    onChange={() => onChange?.(opt)}
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {opt.label} {opt.price ? `(₹${opt.price})` : "(Free)"}
                    </div>
                    <div className="text-xs text-gray-600">ETA: {opt.eta}</div>
                  </div>
                </div>
                {!opt.available && <span className="text-xs text-gray-500">Not serviceable</span>}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
