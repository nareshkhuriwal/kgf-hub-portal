import { useLocation, Link } from "react-router-dom";

export default function Services() {
  const { state } = useLocation();
  const services = state?.services ?? [];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Professional Services</h2>
          <p className="text-gray-600">From websites to mobile apps—get expert help.</p>
        </div>
        <Link to="/" className="btn-outline">Back to Home</Link>
      </div>

      {services.length === 0 ? (
        <p className="text-gray-600">
          No data received. Use the <span className="font-medium">Services</span> button in the header to pass dummy JSON.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.id} className="card">
              <h3 className="card-title">{s.name}</h3>
              <p className="card-price">
                Starting at {s.price.toLocaleString("en-IN")} {s.currency}
              </p>
              <button className="btn-outline mt-3 w-full">Get Quote</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
