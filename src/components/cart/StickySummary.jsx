export default function StickySummary({ children }) {
  return (
    <div className="md:sticky md:top-4">
      {children}
    </div>
  );
}
