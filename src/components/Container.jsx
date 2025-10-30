// src/components/Container.jsx
export default function Container({ className = "", children }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6 ${className}`}>
      {children}
    </div>
  );
}
