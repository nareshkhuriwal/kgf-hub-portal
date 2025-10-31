export default function AddressBanner({ address, onChange }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">Deliver to: <span className="font-semibold text-gray-900">{address?.name}</span>, {address?.pincode}</div>
          <div className="text-sm text-gray-700 truncate">
            {address?.line1}, {address?.city}, {address?.state}, {address?.pincode}
          </div>
        </div>
        <button
          className="rounded-lg border border-pink-300 bg-white px-3 py-1.5 text-pink-600 hover:bg-pink-50"
          onClick={onChange}
        >
          CHANGE ADDRESS
        </button>
      </div>
    </div>
  );
}
