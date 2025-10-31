// Mock service for DEV. Swap with real API later:
// GET /shipping/options?pincode=XXXXXX -> { options: [{id,label,price,eta,available}] }
export async function getShippingOptions(pincode) {
  await new Promise((r) => setTimeout(r, 300));

  // Simple mock: Express unavailable for codes starting with 000/123/555
  const code = String(pincode || "").trim();
  const expressAvailable = !/^(000|123|555)/.test(code);

  // Basic region flavor for demo ETAs
  const isUS = /^\d{5}$/.test(code);
  const etaStd = isUS ? "4–7 days" : "3–5 days";
  const etaExp = isUS ? "2–3 days" : "1–2 days";

  return {
    options: [
      { id: "standard", label: "Standard", price: 49,  eta: etaStd, available: true },
      { id: "express",  label: "Express",  price: 99, eta: etaExp, available: expressAvailable },
    ],
  };
}
