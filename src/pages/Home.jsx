import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand-50 to-white p-10">
        <div className="max-w-2xl">
          <span className="badge-new">New</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
            Build your digital store & services—fast
          </h1>
          <p className="mt-3 text-gray-600">
            React + Vite + Tailwind stack. Clean UI, ready to scale into a full e-commerce.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/products" className="btn-primary">Browse Products</Link>
            <Link to="/services" className="btn-outline">View Services</Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-200/40 blur-3xl" />
      </div>

      {/* Featured tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Starter Website", price: "₹19,999" },
          { title: "React Admin Template", price: "₹9,999" },
          { title: "SEO Booster Pack", price: "₹4,999" },
        ].map((p) => (
          <article key={p.title} className="card">
            <h3 className="card-title">{p.title}</h3>
            <p className="card-price">{p.price}</p>
            <button className="btn-outline mt-3 w-full">Add to Cart</button>
          </article>
        ))}
      </div>
    </section>
  );
}
